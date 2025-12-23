-- Исправляем тип поля savingGoals с text[] на jsonb
ALTER TABLE "User" 
ALTER COLUMN "savingGoals" TYPE JSONB 
USING CASE 
    WHEN "savingGoals" = '{}' THEN '[]'::JSONB
    ELSE array_to_json("savingGoals")::JSONB
END;