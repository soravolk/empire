# Database Setup Guide

This directory contains the PostgreSQL database configuration and schema for the Empire project.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Basic understanding of PostgreSQL

## Quick Start

1. Start the PostgreSQL database:
```bash
docker-compose up -d
```

This will:
- Create a PostgreSQL 17 container
- Initialize the database with name 'empire'
- Create necessary tables using schema.sql
- Expose the database on port 5432

## Configuration

The database is configured with the following default settings:
- Database Name: empire
- User: empire
- Port: 5432 (exposed to host machine)
- Host: localhost (when connecting from host) or postgres (when connecting from other containers)

## Directory Structure

- `docker-compose.yml` - Docker configuration for PostgreSQL
- `schema.sql` - Database schema and initial setup SQL
- `.pgdata/` - PostgreSQL data directory (gitignored)

## Environment Variables

When connecting from the backend, ensure your `.env` file has these settings:
```
PG_USER=empire
PG_HOST=localhost  # Use 'postgres' if connecting from another container
PG_DATABASE=empire
```

## Useful Commands

Start the database:
```bash
docker-compose up -d
```

Stop the database:
```bash
docker-compose down
```

View database logs:
```bash
docker-compose logs -f
```

Reset database (warning: this will delete all data):
```bash
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

1. If you can't connect to the database:
   - Check if the container is running: `docker ps`
   - Verify port availability: `netstat -an | grep 5432`
   - Test connection: `psql -h localhost -U empire -d empire`

2. If schema doesn't load:
   - Check docker-compose logs for SQL errors
   - Verify schema.sql file permissions
