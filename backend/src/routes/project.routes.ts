import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const projectController = new ProjectController();
const authMiddleware = new AuthMiddleware();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate.bind(authMiddleware));

// Project CRUD routes
router.post('/', projectController.createProject.bind(projectController));
router.get('/', projectController.getProjects.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

// Project status management
router.patch('/:id/status', projectController.updateStatus.bind(projectController));

// Team member management
router.post('/:id/members', projectController.addMember.bind(projectController));
router.delete('/:id/members/:userId', projectController.removeMember.bind(projectController));

// Milestone management
router.post('/:id/milestones', projectController.addMilestone.bind(projectController));
router.put('/:id/milestones/:milestoneIndex', projectController.updateMilestone.bind(projectController));

export default router; 