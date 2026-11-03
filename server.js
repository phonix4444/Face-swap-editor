const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// In-memory project store
let projects = [
    {
        id: 'proj-1',
        title: 'Cinematic Movie Scene Face Swap',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'Completed',
        duration: '00:15',
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
        id: 'proj-2',
        title: 'Music Video Cameo',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'Completed',
        duration: '00:30',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
];

let exportedVideos = [
    {
        id: 'exp-1',
        title: 'Cinematic Movie Scene Face Swap (Exported)',
        exportDate: new Date(Date.now() - 3600000 * 4).toISOString(),
        resolution: '1080p 60fps',
        fileSize: '24.5 MB',
        downloadUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
];

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', message: 'AI Face Swap Backend Running Successfully' });
});

app.get('/api/projects', (req, res) => {
    res.json(projects);
});

app.get('/api/exports', (req, res) => {
    res.json(exportedVideos);
});

app.post('/api/upload-face', upload.single('face'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No face image uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
        message: 'Face uploaded successfully',
        url: fileUrl,
        filename: req.file.filename
    });
});

app.post('/api/upload-video', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const newProject = {
        id: 'proj-' + Date.now(),
        title: req.file.originalname.replace(/\.[^/.]+$/, ""),
        createdAt: new Date().toISOString(),
        status: 'Draft',
        duration: '00:20',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600',
        videoUrl: fileUrl
    };
    projects.unshift(newProject);
    res.json({
        message: 'Video uploaded successfully',
        project: newProject,
        url: fileUrl
    });
});

app.post('/api/process-swap', (req, res) => {
    const { projectId, faceUrl, settings } = req.body;
    
    // Simulate AI processing progress / completion
    setTimeout(() => {
        const proj = projects.find(p => p.id === projectId);
        if (proj) {
            proj.status = 'Completed';
        }
        const exportItem = {
            id: 'exp-' + Date.now(),
            title: proj ? proj.title + ' (Face Swapped)' : 'Face Swapped Video',
            exportDate: new Date().toISOString(),
            resolution: settings?.resolution || '1080p',
            fileSize: '18.2 MB',
            downloadUrl: proj ? proj.videoUrl : 'https://www.w3schools.com/html/mov_bbb.mp4'
        };
        exportedVideos.unshift(exportItem);
    }, 2000);

    res.json({
        success: true,
        message: 'AI Face Swap processing initiated successfully',
        estimatedTime: '15 seconds'
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
