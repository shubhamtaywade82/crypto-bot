#!/bin/bash

# ========================================
# Node.js backend code context generator
# ========================================

# Usage:
# 1️⃣ Place this script in root folder of Node.js app
# 2️⃣ Run: chmod +x get_code_context_nodejs.sh
# 3️⃣ Execute: ./get_code_context_nodejs.sh

project_dir=$(pwd)
output_file="${project_dir}/code_context.txt"

# Clean previous output file
if [ -f "$output_file" ]; then
  rm "$output_file"
fi

# Common backend folders in Node.js apps
directories=("src" "app" "api" "server" "services" "controllers" "models" "routes" "config" "middleware" "utils" "lib")

# Ignore these file types (non-code files)
ignore_files=("*.log" "*.md" "*.json" "*.lock" "*.env" "*.env.*" "*.txt" "*.csv" "*.yml" "*.yaml" "*.sample" "*.example" "*.gitignore" "*.dockerignore")

# Ignore these folders
ignore_directories=("node_modules" ".git" "logs" "tmp" "coverage" "dist" "build" "public" "docs" "test" "tests" "__tests__")

# Recursive function to scan files
read_files() {
  for entry in "$1"/*; do
    if [ -d "$entry" ]; then
      dir_name=$(basename "$entry")
      if [[ ! " ${ignore_directories[@]} " =~ " ${dir_name} " ]]; then
        read_files "$entry"
      fi
    elif [ -f "$entry" ]; then
      should_ignore=false
      for ignore_pattern in "${ignore_files[@]}"; do
        if [[ "$entry" == $ignore_pattern || "$entry" == */$ignore_pattern ]]; then
          should_ignore=true
          break
        fi
      done

      if ! $should_ignore; then
        relative_path=${entry#"$project_dir/"}
        echo "# File: $relative_path" >> "$output_file"
        cat "$entry" >> "$output_file"
        echo -e "\n" >> "$output_file"
      fi
    fi
  done
}

# Process all directories in list
for dir in "${directories[@]}"; do
  if [ -d "${project_dir}/${dir}" ]; then
    read_files "${project_dir}/${dir}"
  fi
done

echo "✅ Code context saved in: ${output_file}"
