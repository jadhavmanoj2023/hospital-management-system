# Backend API Documentation

Hospital Management System – Node.js/Express backend.

---

## Environment Variables (use `.env` in backend folder)

All credentials and config must be stored in `backend/.env`. Do not commit real values.

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `FRONTEND_URL` | Frontend (patient) origin for CORS | `http://localhost:5173` |
| `DASHBOARD_URL` | Dashboard (admin) origin for CORS | `http://localhost:5174` |
| `JWT_SECRET_KEY` | Secret for signing JWT | (long random string) |
| `JWT_EXPIRES` | JWT expiry | `7d` |
| `COOKIE_EXPIRE` | Cookie expiry in days | `7` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | (from Cloudinary dashboard) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | (from Cloudinary dashboard) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | (from Cloudinary dashboard) |

**Note:** Copy `backend/.env.example` to `backend/.env` and fill in real values. Keep `.env` out of version control. Run the server from the `backend` directory so `.env` is loaded from there (e.g. `cd backend && npm start`).

---

## Base URL

- Local: `http://localhost:4000` (or whatever `PORT` is in `.env`)
- All API routes are under: `/api/v1/`

---

## Authentication

- **Patient (frontend):** Cookie name `patientToken` (set on login/register).
- **Admin (dashboard):** Cookie name `adminToken` (set on login).
- Cookies are **httpOnly**; send credentials in requests (e.g. `credentials: 'include'`).
- Protected routes expect the correct cookie and role; otherwise they return 400/403.

---

## API Endpoints

### 1. Messages (`/api/v1/message`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/message/send` | No | Submit a contact message |
| `GET`  | `/api/v1/message/getall` | Admin | Get all messages |

#### POST `/api/v1/message/send`

- **Body (JSON):** `firstName`, `lastName`, `email`, `phone`, `message` (all required).
- **Validation:** First/last name min 3 chars; email valid; phone 10 digits; message min 10 chars.
- **Response:** `200` – `{ success: true, message: "Message Sent!" }`.

#### GET `/api/v1/message/getall`

- **Auth:** Admin (cookie `adminToken`).
- **Response:** `200` – `{ success: true, messages: [...] }`.

---

### 2. Users (`/api/v1/user`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/user/patient/register` | No | Patient registration |
| `POST` | `/api/v1/user/login` | No | Login (Patient or Admin) |
| `POST` | `/api/v1/user/admin/addnew` | Admin | Add new admin |
| `POST` | `/api/v1/user/doctor/addnew` | Admin | Add new doctor (with avatar) |
| `GET`  | `/api/v1/user/doctors` | No | List all doctors |
| `GET`  | `/api/v1/user/patient/me` | Patient | Current patient profile |
| `GET`  | `/api/v1/user/admin/me` | Admin | Current admin profile |
| `GET`  | `/api/v1/user/patient/logout` | Patient | Patient logout |
| `GET`  | `/api/v1/user/admin/logout` | Admin | Admin logout |

#### POST `/api/v1/user/patient/register`

- **Body:** `firstName`, `lastName`, `email`, `phone`, `aadhar`, `dob`, `gender`, `password` (all required).
- **Validation:** Name min 3 chars; email valid; phone 10 digits; Aadhar 12 digits; gender `"Male"` or `"Female"`; password min 8 chars.
- **Response:** Sets `patientToken` cookie and returns `{ success, message, user, token }`.

#### POST `/api/v1/user/login`

- **Body:** `email`, `password`, `confirmPassword`, `role` (e.g. `"Patient"` or `"Admin"`). `password` must equal `confirmPassword`; `role` must match user’s role.
- **Response:** Sets `adminToken` or `patientToken` and returns `{ success, message, user, token }`.

#### POST `/api/v1/user/admin/addnew`

- **Auth:** Admin.
- **Body:** Same as patient register (`firstName`, `lastName`, `email`, `phone`, `aadhar`, `dob`, `gender`, `password`).
- **Response:** `200` – `{ success: true, message: "New Admin Registered", admin }`.

#### POST `/api/v1/user/doctor/addnew`

- **Auth:** Admin.
- **Body (form-data):** `docAvatar` (file: PNG/JPEG/WebP), plus `firstName`, `lastName`, `email`, `phone`, `aadhar`, `dob`, `gender`, `password`, `doctorDepartment`.
- **Response:** `200` – `{ success: true, message: "New Doctor Registered", doctor }`. Avatar is uploaded to Cloudinary using env credentials.

#### GET `/api/v1/user/doctors`

- **Response:** `200` – `{ success: true, doctors: [...] }`. Only users with role `Doctor`.

#### GET `/api/v1/user/patient/me` / `/api/v1/user/admin/me`

- **Auth:** Patient or Admin respectively.
- **Response:** `200` – `{ success: true, user }`.

#### GET `/api/v1/user/patient/logout` / `/api/v1/user/admin/logout`

- **Auth:** Patient or Admin respectively.
- **Response:** Clears cookie and returns `201` – `{ success: true, message: "..." }`.

---

### 3. Appointments (`/api/v1/appointment`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST`   | `/api/v1/appointment/post` | Patient | Create appointment |
| `GET`    | `/api/v1/appointment/getall` | Admin | Get all appointments |
| `PUT`    | `/api/v1/appointment/update/:id` | Admin | Update appointment (e.g. status) |
| `DELETE` | `/api/v1/appointment/delete/:id` | Admin | Delete appointment |

#### POST `/api/v1/appointment/post`

- **Auth:** Patient.
- **Body:** `firstName`, `lastName`, `email`, `phone`, `aadhar`, `dob`, `gender`, `appointment_date`, `department`, `doctor_firstName`, `doctor_lastName`, `address`; optional `hasVisited`.
- **Logic:** Resolves doctor by name + department; ensures exactly one match. Creates appointment with `patientId` from logged-in user and `doctorId` from that doctor. Status defaults to `"Pending"`.
- **Response:** `200` – `{ success: true, appointment, message: "Appointment Send!" }`.

#### GET `/api/v1/appointment/getall`

- **Auth:** Admin.
- **Response:** `200` – `{ success: true, appointments: [...] }`.

#### PUT `/api/v1/appointment/update/:id`

- **Auth:** Admin.
- **Body:** Any appointment fields (typically `status`: `"Pending"` | `"Accepted"` | `"Rejected"`).
- **Response:** `200` – `{ success: true, message: "Appointment Status Updated!" }`.

#### DELETE `/api/v1/appointment/delete/:id`

- **Auth:** Admin.
- **Response:** `200` – `{ success: true, message: "Appointment Deleted!" }`.

---

## Error Responses

- **400:** Validation error, wrong role, or not authenticated (e.g. missing/invalid cookie).
- **403:** Authenticated but wrong role for the resource.
- **404:** Resource not found (e.g. appointment or doctor).
- **500:** Server/Cloudinary error.

All errors return JSON: `{ success: false, message: "..." }`.

---

## Summary Table (all endpoints)

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/v1/message/send` | — |
| GET  | `/api/v1/message/getall` | Admin |
| POST | `/api/v1/user/patient/register` | — |
| POST | `/api/v1/user/login` | — |
| POST | `/api/v1/user/admin/addnew` | Admin |
| POST | `/api/v1/user/doctor/addnew` | Admin |
| GET  | `/api/v1/user/doctors` | — |
| GET  | `/api/v1/user/patient/me` | Patient |
| GET  | `/api/v1/user/admin/me` | Admin |
| GET  | `/api/v1/user/patient/logout` | Patient |
| GET  | `/api/v1/user/admin/logout` | Admin |
| POST | `/api/v1/appointment/post` | Patient |
| GET  | `/api/v1/appointment/getall` | Admin |
| PUT  | `/api/v1/appointment/update/:id` | Admin |
| DELETE | `/api/v1/appointment/delete/:id` | Admin |

---

## How the backend is structured

- **Entry:** `server.js` – loads env, configures Cloudinary from env, connects DB via `dbConnection()`, mounts `app.js` and starts server on `PORT`.
- **App:** `app.js` – loads dotenv from `.env`, CORS (using `FRONTEND_URL`, `DASHBOARD_URL`), cookie-parser, JSON, file-upload, mounts routers under `/api/v1/...`, then global error middleware.
- **Routers:** `router/messageRouter.js`, `router/userRouter.js`, `router/appointmentRouter.js` – define routes and auth middleware.
- **Controllers:** Handle request/response and call models; use `catchAsyncErrors` and `ErrorHandler` for errors.
- **Models:** Mongoose schemas for User, Message, Appointment.
- **Auth:** JWT in httpOnly cookies (`adminToken` / `patientToken`); `auth.js` verifies token with `JWT_SECRET_KEY` and attaches `req.user`.

All credentials (MongoDB, JWT, Cloudinary, URLs, PORT) are read from `process.env` and must be set in `backend/.env`.
