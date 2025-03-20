#!/bin/bash
# app.michaelwuensch.bitbanana.sh v0.9.2
# This script builds BitBanana from source and verifies reproducibility.
# It clones the repository, builds using Docker, generates APKs with bundletool,
# runs BitBanana's own verification process

# Create workDir if it doesn't exist
mkdir -p "$workDir/bitbanana"

# Clone the BitBanana repository into workDir
git clone https://github.com/michaelWuensch/BitBanana "$workDir/bitbanana"
cd "$workDir/bitbanana"

versionTag="$versionName"

git checkout "v$versionTag"

# Move to reproducible-builds directory
cd reproducible-builds

# Build Docker image
docker build --platform linux/amd64 -t bitbanana-build-env .

# Move back to root directory
cd "$workDir/bitbanana"

# Build the app by running the container
docker run --rm --privileged -v "$(pwd)":/app-src --device /dev/fuse --cap-add SYS_ADMIN bitbanana-build-env bash -c "mkdir /app; disorderfs --sort-dirents=yes --reverse-dirents=no /app-src/ /app/; cd /app && gradle clean bundleRelease"

# Download the latest bundletool
curl -L -o bundletool.jar https://github.com/google/bundletool/releases/download/1.18.0/bundletool-all-1.18.0.jar
ls -lh bundletool*.jar

# Create directory where the apks will be placed
mkdir -p ./reproducible-builds/apks/built-apks

# Wait for and verify device-spec.json
max_attempts=5
attempt=1
while [ $attempt -le $max_attempts ]; do
  if [ -f "$workDir/device-spec.json" ]; then
    echo "Found device-spec.json in workDir"
    if ! cp "$workDir/device-spec.json" ./device-spec.json; then
      echo "Error: Failed to copy device-spec.json from workDir"
      exit 1
    fi
    echo "device-spec.json contents:"
    cat ./device-spec.json
    break
  else
    echo "Waiting for device-spec.json to be created (attempt $attempt of $max_attempts)..."
    sleep 2
    attempt=$((attempt + 1))
  fi
done

if [ $attempt -gt $max_attempts ]; then
  echo "Error: device-spec.json not found in workDir after $max_attempts attempts: $workDir"
  exit 1
fi

# Run bundletool
java -jar bundletool.jar build-apks \
  --bundle=./app/build/outputs/bundle/release/bitbanana-${versionName}_${versionCode}-release.aab \
  --output-format=DIRECTORY \
  --output=./reproducible-builds/apks/built-apks \
  --device-spec="device-spec.json"

# Copy to expected folder
echo "Copying produced artifacts for testAAB.sh comparison"
mkdir -p "$workDir/built-split_apks"
cp -r ./reproducible-builds/apks/built-apks/splits/*.apk "$workDir/built-split_apks"

# ===== BITBANANA'S OWN VERIFICATION PROCESS =====
echo ""
echo "=============================================================="
echo "BEGINNING BITBANANA'S OWN VERIFICATION PROCESS"
echo "=============================================================="
echo ""

# Bitbanana internal comparison to copy from source APK directory
mkdir -p ./reproducible-builds/apks/playstore-apks/
echo "Copying Play Store APKs from $apkDir to ./reproducible-builds/apks/playstore-apks/"
cp -r "$apkDir"/*.apk ./reproducible-builds/apks/playstore-apks/

# Move into reproducible-builds folder
cd ./reproducible-builds

# Execute python script to format output
echo "========================================"
echo "Step 1: Executing MakeComparable.py to format output"
echo "========================================"
echo "This script:"
echo "- Copies apks/ to extracted_apks/"
echo "- Moves all .apk files from built-apks/splits to built-apks"
echo "- Deletes now empty built-apks/splits folder and toc.pb"
echo "- Renames built-apks/base-master.apk to base.apk"
echo "- Renames other apks by replacing 'base' with 'split_config'"
echo "- Extracts all apks and deletes the original apk files"
echo ""

# Run the script and capture its output
MAKE_COMPARABLE_OUTPUT=$(python3 MakeComparable.py --decompile 2>&1)
MAKE_COMPARABLE_STATUS=$?

# Print a summary of the output
echo "MakeComparable.py execution completed with status: $MAKE_COMPARABLE_STATUS"
if [ $MAKE_COMPARABLE_STATUS -ne 0 ]; then
  echo "ERROR: MakeComparable.py failed!"
  echo "Output:"
  echo "$MAKE_COMPARABLE_OUTPUT"
else
  echo "MakeComparable.py completed successfully."
fi

# Runs bitbanana's internal comparison script
echo ""
echo "=============================================="
echo "Step 2: Running BitBanana's Diff.py comparison script"
echo "=============================================="
echo "This script compares the extracted APKs ignoring expected differences:"
echo "- META-INF (signatures)"
echo "- stamp-cert-sha256"
echo "- unknown"
echo "- AndroidManifest.xml"
echo "- apktool.yml"
echo ""

# Run the script and capture its output
DIFF_OUTPUT=$(python3 Diff.py 2>&1)
DIFF_STATUS=$?

# Print the output
echo "BitBanana's Diff.py output:"
echo "----------------------------------------"
echo "$DIFF_OUTPUT"
echo "----------------------------------------"

# Interpret the results
if [ $DIFF_STATUS -ne 0 ]; then
  echo "ERROR: BitBanana's Diff.py script failed with status: $DIFF_STATUS"
elif echo "$DIFF_OUTPUT" | grep -q "No differences found"; then
  echo "RESULT: VERIFIED - BitBanana's verification process found no unexpected differences!"
  echo "According to BitBanana's own verification process, the build is REPRODUCIBLE."
else
  echo "RESULT: FAILED - BitBanana's verification process found unexpected differences!"
  echo "According to BitBanana's own verification process, the build is NOT REPRODUCIBLE."
fi

echo ""
echo "=============================================================="
echo "COMPLETED BITBANANA'S OWN VERIFICATION PROCESS"
echo "=============================================================="
echo ""

# Return to the original directory to allow testAAB.sh to continue its process
cd "$workDir"