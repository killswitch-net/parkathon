FROM python:3.9-alpine as python-code

WORKDIR /app

RUN apk add --no-cache gcc g++ musl-dev python3-dev libffi-dev libc-dev

COPY requirements.txt .

RUN python3 -m venv /venv
RUN /venv/bin/pip install --upgrade pip setuptools wheel && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PATH="/venv/bin:$PATH"

ARG MY_HOST
ARG DB_HOST
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG OPENAI_API_KEY

ENV MY_HOST=$MY_HOST
ENV DB_HOST=$DB_HOST
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_NAME=$DB_NAME

EXPOSE 9001
CMD ["python", "app.py"]
