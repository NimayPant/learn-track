# Student Activity Manager

> **Note:** This project was built for our 4th-semester DBMS (Database Management Systems) class in college. It was developed by a team of 2.

A simple fullstack app using Node.js, Express, Oracle Database, and plain HTML/CSS/JavaScript. It manages student, activity, and student activity performance data in a normalized 3NF schema.

## Features

- Student, activity, and performance management
- Create / read / update / delete operations
- Graphical report section with averages and counts
- Oracle trigger to validate scores
- Oracle stored procedure to add activity scores

## Setup

1. Copy `.env.example` to `.env` and fill in your Oracle credentials.
2. Install dependencies:

```bash
npm install
```

3. Create the database objects using one of these options:
   - Run `npm run setup-db` to create tables and procedures automatically in the current Oracle schema.
   - Or run `db/setup.sql` in Oracle SQL*Plus, SQLcl, or another Oracle client.

4. Start the app:

```bash
npm start
```

5. Open `http://localhost:5000` in a browser.

## Oracle Notes

- You must have the Oracle Instant Client installed and properly configured.
- `oracledb` requires Oracle client libraries available in the system path.

## Database Schema

The app uses the following tables:

- `students`
- `activities`
- `student_activities`

These tables are normalized for student and activity data, with a many-to-many relationship for student performance.

## Endpoints

- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `GET /api/activities`
- `GET /api/student-activities`
- `POST /api/student-activities`
- `PUT /api/student-activities/:id`
- `DELETE /api/student-activities/:id`
- `GET /api/reports/average-scores`

## License

MIT
