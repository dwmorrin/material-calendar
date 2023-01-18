# tasks to run prior to create react app build
# meant to be registered in package.json as the prebuild script

commit_hash=$(git rev-parse --short HEAD)

out_file=".env.production.local"

key="REACT_APP_COMMIT"

if [[ ! -f $out_file ]]; then
  echo "$key=$commit_hash" > $out_file
else
  tmp_file="tmpfile_$$"
  if sed 's/'"$key"'=.*/'"$key"'='"$commit_hash"'/' \
    $out_file > "$tmp_file"; then
    mv "$tmp_file" "$out_file"
  fi
fi