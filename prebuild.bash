# tasks to run prior to create react app build
# meant to be registered in package.json as the prebuild script

commit_hash=$(git rev-parse --short HEAD)

out_file=".env.production.local"

echo "REACT_APP_COMMIT=$commit_hash" > $out_file