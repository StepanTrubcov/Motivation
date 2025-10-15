#!/bin/bash

# Скрипт для добавления 'use client' в начало всех .jsx файлов

find /Users/stepantrubcov/Documents/Motivation/my-app/client/src/components -name "*.jsx" -type f | while read file; do
  # Проверяем, есть ли уже 'use client'
  if ! grep -q "'use client'" "$file" && ! grep -q '"use client"' "$file"; then
    # Проверяем, использует ли файл хуки React
    if grep -qE "(useState|useEffect|useRef|useCallback|useMemo|useContext|useReducer|useDispatch|useSelector)" "$file"; then
      echo "Добавление 'use client' в: $file"
      # Добавляем 'use client' в начало файла
      echo "'use client';
$(cat "$file")" > "$file"
    fi
  fi
done

echo "Готово!"
