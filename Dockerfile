# Use a lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files into the container
COPY . .

# Expose the port Flask will run on
EXPOSE 5000

# Command to run the web application
CMD ["python", "web_app.py"]