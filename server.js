const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const db = require('./db/oracle');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;

const mapRows = rows => rows;

app.get('/api/students', async (req, res) => {
  try {
    const result = await db.query('SELECT id, first_name, last_name, email, created_at FROM students ORDER BY id');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { first_name, last_name, email } = req.body;
  try {
    await db.execute(
      `INSERT INTO students (first_name, last_name, email) VALUES (:first_name, :last_name, :email)`,
      { first_name, last_name, email }
    );
    res.status(201).json({ message: 'Student created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;
  try {
    await db.execute(
      `UPDATE students SET first_name = :first_name, last_name = :last_name, email = :email WHERE id = :id`,
      { id: Number(id), first_name, last_name, email }
    );
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(`DELETE FROM students WHERE id = :id`, { id: Number(id) });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teachers', async (req, res) => {
  try {
    const result = await db.query('SELECT id, first_name, last_name, email FROM teachers ORDER BY id');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  const { first_name, last_name, email } = req.body;
  try {
    await db.execute(
      `INSERT INTO teachers (first_name, last_name, email) VALUES (:first_name, :last_name, :email)`,
      { first_name, last_name, email }
    );
    res.status(201).json({ message: 'Teacher created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.name, c.description, c.teacher_id, t.first_name, t.last_name
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      ORDER BY c.id
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const { name, description, teacher_id } = req.body;
  try {
    await db.execute(
      `INSERT INTO courses (name, description, teacher_id) VALUES (:name, :description, :teacher_id)`,
      { name, description, teacher_id: Number(teacher_id) }
    );
    res.status(201).json({ message: 'Course created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, category, max_points FROM activities ORDER BY id');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', async (req, res) => {
  const { name, category, max_points } = req.body;
  try {
    await db.execute(
      `INSERT INTO activities (name, category, max_points) VALUES (:name, :category, :max_points)`,
      { name, category, max_points: Number(max_points) }
    );
    res.status(201).json({ message: 'Activity created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, max_points } = req.body;
  try {
    await db.execute(
      `UPDATE activities SET name = :name, category = :category, max_points = :max_points WHERE id = :id`,
      { id: Number(id), name, category, max_points: Number(max_points) }
    );
    res.json({ message: 'Activity updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(`DELETE FROM activities WHERE id = :id`, { id: Number(id) });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/student-activities', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sa.id,
             sa.student_id,
             sa.activity_id,
             sa.score,
             sa.completed_at,
             s.first_name,
             s.last_name,
             a.name AS activity_name,
             a.max_points
      FROM student_activities sa
      JOIN students s ON sa.student_id = s.id
      JOIN activities a ON sa.activity_id = a.id
      ORDER BY sa.id
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student-activities', async (req, res) => {
  const { student_id, activity_id, score } = req.body;
  try {
    await db.execute(
      `BEGIN add_student_activity(:student_id, :activity_id, :score); END;`,
      { student_id: Number(student_id), activity_id: Number(activity_id), score: Number(score) }
    );
    res.status(201).json({ message: 'Performance record added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/student-activities/:id', async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  try {
    await db.execute(
      `UPDATE student_activities SET score = :score WHERE id = :id`,
      { score: Number(score), id: Number(id) }
    );
    res.json({ message: 'Performance updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/student-activities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(`DELETE FROM student_activities WHERE id = :id`, { id: Number(id) });
    res.json({ message: 'Performance record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/average-scores', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.id AS student_id,
             s.first_name,
             s.last_name,
             ROUND(AVG(sa.score), 2) AS average_score,
             COUNT(sa.id) AS activity_count
      FROM students s
      LEFT JOIN student_activities sa ON sa.student_id = s.id
      GROUP BY s.id, s.first_name, s.last_name
      ORDER BY average_score DESC NULLS LAST
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/activity-summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id AS activity_id,
             a.name,
             a.category,
             a.max_points,
             COUNT(sa.id) AS submissions,
             ROUND(AVG(sa.score), 2) AS avg_score
      FROM activities a
      LEFT JOIN student_activities sa ON sa.activity_id = a.id
      GROUP BY a.id, a.name, a.category, a.max_points
      ORDER BY submissions DESC NULLS LAST
    `);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
