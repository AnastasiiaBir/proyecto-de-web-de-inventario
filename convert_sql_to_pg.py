import re

# путь к исходному файлу MySQL
input_file = "/home/nasstasiia/inventario5.sql"

# путь к файлу PostgreSQL
output_file = "/home/nasstasiia/inventario_pg.sql"

with open(input_file, "r", encoding="utf-8") as f:
    sql = f.read()

# Убираем MySQL-параметры
sql = re.sub(r"SET\s+sql_mode=.*?;\n", "", sql)
sql = re.sub(r"SET\s+time_zone=.*?;\n", "", sql)

# Заменяем тип AUTO_INCREMENT на SERIAL
sql = re.sub(r"`(\w+)`\s+int\(\d+\)\s+NOT NULL AUTO_INCREMENT", r'"\1" SERIAL PRIMARY KEY', sql)

# Заменяем обратные кавычки ` на двойные "
sql = sql.replace("`", '"')

# Убираем ENGINE=InnoDB и DEFAULT CHARSET
sql = re.sub(r"ENGINE=.*?;", ";", sql)

# Сохраняем результат
with open(output_file, "w", encoding="utf-8") as f:
    f.write(sql)

print("Готово! Файл PostgreSQL:", output_file)
