const studentForm = document.getElementById('student-form');
const activityForm = document.getElementById('activity-form');
const scoreForm = document.getElementById('score-form');
const teacherForm = document.getElementById('teacher-form');
const courseForm = document.getElementById('course-form');
const studentsList = document.getElementById('students-list');
const activitiesList = document.getElementById('activities-list');
const scoresList = document.getElementById('scores-list');
const teachersList = document.getElementById('teachers-list');
const coursesList = document.getElementById('courses-list');
const reportSummary = document.getElementById('report-summary');
const reportActivitySummary = document.getElementById('report-activity-summary');
const studentSelect = document.getElementById('student-select');
const activitySelect = document.getElementById('activity-select');
const scoreIdField = document.getElementById('score-id');
const scoreSubmitButton = document.querySelector('#score-form button[type="submit"]');
const courseTeacherSelect = document.getElementById('course-teacher');

let students = [];
let activities = [];
let teachers = [];
let courses = [];

async function request(url, method = 'GET', data) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

async function loadStudents() {
  students = await request('/api/students');
  studentSelect.innerHTML = '<option value="">Select a student</option>' +
    students.map(s => `<option value="${s.ID}">${s.FIRST_NAME} ${s.LAST_NAME}</option>`).join('');
  renderStudents();
}

async function loadActivities() {
  activities = await request('/api/activities');
  activitySelect.innerHTML = '<option value="">Select an activity</option>' +
    activities.map(a => `<option value="${a.ID}">${a.NAME} (${a.CATEGORY || 'General'})</option>`).join('');
  renderActivities();
}

async function loadTeachers() {
  teachers = await request('/api/teachers');
  if (courseTeacherSelect) {
    courseTeacherSelect.innerHTML = '<option value="">Select a teacher</option>' + 
      teachers.map(t => `<option value="${t.ID}">${t.FIRST_NAME} ${t.LAST_NAME}</option>`).join('');
  }
  renderTeachers();
}

async function loadCourses() {
  courses = await request('/api/courses');
  renderCourses();
}

async function loadScores() {
  const records = await request('/api/student-activities');
  scoresList.innerHTML = renderScores(records);
}

let scoresChartInstance = null;
let activitiesChartInstance = null;

async function loadReports() {
  const studentsReport = await request('/api/reports/average-scores');
  const activityReport = await request('/api/reports/activity-summary');
  
  const topStudents = studentsReport.slice(0, 5).filter(s => s.AVERAGE_SCORE != null);

  const scoreCtx = document.getElementById('scoresChart');
  const activityCtx = document.getElementById('activitiesChart');
  
  if (scoreCtx && activityCtx) {
    if (scoresChartInstance) scoresChartInstance.destroy();
    scoresChartInstance = new Chart(scoreCtx, {
      type: 'bar',
      data: {
        labels: topStudents.map(s => `${s.FIRST_NAME} ${s.LAST_NAME}`),
        datasets: [{
          label: 'Average Score',
          data: topStudents.map(s => s.AVERAGE_SCORE),
          backgroundColor: '#5b8df9',
          borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    if (activitiesChartInstance) activitiesChartInstance.destroy();
    activitiesChartInstance = new Chart(activityCtx, {
      type: 'doughnut',
      data: {
        labels: activityReport.map(a => a.NAME),
        datasets: [{
          data: activityReport.map(a => a.SUBMISSIONS),
          backgroundColor: ['#5b8df9', '#7ec2ff', '#3d62ff', '#e15b67', '#d8dce6']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });
  }
  
  reportSummary.innerHTML = `
    <h3>🏆 Top 5 Students</h3>
    <div class="table-container">
    <table>
      <thead><tr><th>Rank</th><th>Student</th><th>Average</th><th>Activities</th></tr></thead>
      <tbody>${topStudents.map((item, index) => `<tr><td>#${index + 1}</td><td><strong>${item.FIRST_NAME} ${item.LAST_NAME}</strong></td><td><span class="tag badge-score">${item.AVERAGE_SCORE}</span></td><td>${item.ACTIVITY_COUNT}</td></tr>`).join('')}</tbody>
    </table>
    </div>

    <h3>Student Average Scores</h3>
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Student</th><th>Average</th><th>Activities</th></tr></thead>
      <tbody>${studentsReport.map((item, index) => `<tr><td>${index + 1}</td><td>${item.FIRST_NAME} ${item.LAST_NAME}</td><td>${item.AVERAGE_SCORE ?? 'N/A'}</td><td>${item.ACTIVITY_COUNT}</td></tr>`).join('')}</tbody>
    </table>
    </div>
  `;
  reportActivitySummary.innerHTML = `
    <h3>Activity Summary</h3>
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Activity</th><th>Category</th><th>Submissions</th><th>Average Score</th></tr></thead>
      <tbody>${activityReport.map((item, index) => `<tr><td>${index + 1}</td><td>${item.NAME}</td><td><span class="tag">${item.CATEGORY || 'General'}</span></td><td>${item.SUBMISSIONS}</td><td>${item.AVG_SCORE ?? 'N/A'}</td></tr>`).join('')}</tbody>
    </table>
    </div>
  `;
}

function renderStudents() {
  studentsList.innerHTML = `
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
      <tbody>${students.map((s, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${s.FIRST_NAME} ${s.LAST_NAME}</td>
          <td>${s.EMAIL}</td>
          <td>
            <button onclick="editStudent(${s.ID})">Edit</button>
            <button class="badge-danger" onclick="deleteStudent(${s.ID})">Delete</button>
          </td>
        </tr>
      `).join('')}</tbody>
    </table>
    </div>
  `;
}

function renderTeachers() {
  teachersList.innerHTML = `
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Name</th><th>Email</th></tr></thead>
      <tbody>${teachers.map((t, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${t.FIRST_NAME} ${t.LAST_NAME}</td>
          <td>${t.EMAIL}</td>
        </tr>
      `).join('')}</tbody>
    </table>
    </div>
  `;
}

function renderCourses() {
  coursesList.innerHTML = `
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Course</th><th>Description</th><th>Teacher</th></tr></thead>
      <tbody>${courses.map((c, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${c.NAME}</td>
          <td>${c.DESCRIPTION || ''}</td>
          <td><span class="tag">${c.FIRST_NAME ? c.FIRST_NAME + ' ' + c.LAST_NAME : 'None'}</span></td>
        </tr>
      `).join('')}</tbody>
    </table>
    </div>
  `;
}

function renderActivities() {
  activitiesList.innerHTML = `
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Activity</th><th>Category</th><th>Max Points</th><th>Actions</th></tr></thead>
      <tbody>${activities.map((a, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${a.NAME}</td>
          <td><span class="tag">${a.CATEGORY || 'None'}</span></td>
          <td>${a.MAX_POINTS}</td>
          <td>
            <button onclick="editActivity(${a.ID})">Edit</button>
            <button class="badge-danger" onclick="deleteActivity(${a.ID})">Delete</button>
          </td>
        </tr>
      `).join('')}</tbody>
    </table>
    </div>
  `;
}

function renderScores(records) {
  return `
    <div class="table-container">
    <table>
      <thead><tr><th>Sl No.</th><th>Student</th><th>Activity</th><th>Score</th><th>Max</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${records.map((r, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${r.FIRST_NAME} ${r.LAST_NAME}</td>
          <td>${r.ACTIVITY_NAME}</td>
          <td><span class="tag badge-score">${r.SCORE}</span></td>
          <td>${r.MAX_POINTS}</td>
          <td>${new Date(r.COMPLETED_AT).toLocaleString()}</td>
          <td>
            <button onclick="editScore(${r.ID})">Edit</button>
            <button class="badge-danger" onclick="deleteScore(${r.ID})">Delete</button>
          </td>
        </tr>
      `).join('')}</tbody>
    </table>
    </div>
  `;
}

studentForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.getElementById('student-id').value;
  const first_name = document.getElementById('first-name').value.trim();
  const last_name = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  try {
    if (id) {
      await request(`/api/students/${id}`, 'PUT', { first_name, last_name, email });
    } else {
      await request('/api/students', 'POST', { first_name, last_name, email });
    }
    studentForm.reset();
    document.getElementById('student-id').value = '';
    await loadStudents();
    await loadReports();
  } catch (err) {
    alert(err.message);
  }
});

activityForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = document.getElementById('activity-id').value;
  const name = document.getElementById('activity-name').value.trim();
  const category = document.getElementById('activity-category').value.trim();
  const max_points = Number(document.getElementById('activity-max').value);
  try {
    if (id) {
      await request(`/api/activities/${id}`, 'PUT', { name, category, max_points });
    } else {
      await request('/api/activities', 'POST', { name, category, max_points });
    }
    activityForm.reset();
    document.getElementById('activity-id').value = '';
    await loadActivities();
    await loadReports();
  } catch (err) {
    alert(err.message);
  }
});

scoreForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = scoreIdField.value;
  const student_id = Number(studentSelect.value);
  const activity_id = Number(activitySelect.value);
  const score = Number(document.getElementById('score-value').value);
  try {
    if (id) {
      await request(`/api/student-activities/${id}`, 'PUT', { score });
    } else {
      await request('/api/student-activities', 'POST', { student_id, activity_id, score });
    }
    scoreForm.reset();
    scoreIdField.value = '';
    scoreSubmitButton.textContent = 'Save record';
    await loadScores();
    await loadReports();
  } catch (err) {
    alert(err.message);
  }
});

teacherForm.addEventListener('submit', async event => {
  event.preventDefault();
  const first_name = document.getElementById('teacher-first').value.trim();
  const last_name = document.getElementById('teacher-last').value.trim();
  const email = document.getElementById('teacher-email').value.trim();
  try {
    await request('/api/teachers', 'POST', { first_name, last_name, email });
    teacherForm.reset();
    await loadTeachers();
    await loadCourses();
  } catch (err) {
    alert(err.message);
  }
});

courseForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = document.getElementById('course-name').value.trim();
  const description = document.getElementById('course-desc').value.trim();
  const teacher_id = document.getElementById('course-teacher').value;
  try {
    await request('/api/courses', 'POST', { name, description, teacher_id: teacher_id ? Number(teacher_id) : null });
    courseForm.reset();
    await loadCourses();
  } catch (err) {
    alert(err.message);
  }
});

window.editStudent = async function(id) {
  const student = students.find(s => s.ID === id);
  if (!student) return;
  document.getElementById('student-id').value = student.ID;
  document.getElementById('first-name').value = student.FIRST_NAME;
  document.getElementById('last-name').value = student.LAST_NAME;
  document.getElementById('email').value = student.EMAIL;
};

window.editActivity = async function(id) {
  const activity = activities.find(a => a.ID === id);
  if (!activity) return;
  document.getElementById('activity-id').value = activity.ID;
  document.getElementById('activity-name').value = activity.NAME;
  document.getElementById('activity-category').value = activity.CATEGORY || '';
  document.getElementById('activity-max').value = activity.MAX_POINTS;
};

window.deleteActivity = async function(id) {
  if (!confirm('Delete this activity and all related records?')) return;
  try {
    await request(`/api/activities/${id}`, 'DELETE');
    await loadActivities();
    await loadScores();
    await loadReports();
  } catch (err) {
    alert(err.message);
  }
};

window.deleteStudent = async function(id) {
  if (!confirm('Delete this student and all related performance records?')) return;
  try {
    await request(`/api/students/${id}`, 'DELETE');
    await loadStudents();
    await loadScores();
    await loadReports();
  } catch (err) {
    alert(err.message);
  }
};

window.editScore = async function(id) {
  const records = await request('/api/student-activities');
  const record = records.find(r => r.ID === id);
  if (!record) return;
  scoreIdField.value = record.ID;
  studentSelect.value = record.STUDENT_ID;
  activitySelect.value = record.ACTIVITY_ID;
  document.getElementById('score-value').value = record.SCORE;
  scoreSubmitButton.textContent = 'Update record';
};

window.deleteScore = async function(id) {
  if (!confirm('Delete this performance record?')) return;
  try {
    await request(`/api/student-activities/${id}`, 'DELETE');
    await loadScores();
    await loadReports();
  } catch (err) {
    alert(err.message);
  }
};

async function bootstrap() {
  try {
    await loadTeachers();
    await loadCourses();
    await loadStudents();
    await loadActivities();
    await loadScores();
    await loadReports();
  } catch (err) {
    scoresList.innerHTML = `<p class="badge-danger">Unable to load data: ${err.message}</p>`;
  }
}

bootstrap();
