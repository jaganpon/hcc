#!/bin/bash
export DB_PATH=./app/dev.db
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
