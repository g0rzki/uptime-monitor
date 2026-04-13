FROM python:3.14-slim

# Katalog roboczy
WORKDIR /app

# Zależności najpierw (cache warstw)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kod aplikacji
COPY . .

# Port uvicorn
EXPOSE 8000

# Start
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]