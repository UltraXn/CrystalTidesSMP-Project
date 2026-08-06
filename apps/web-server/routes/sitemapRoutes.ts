import { Router } from 'express';
import { getSitemapXml } from '../controllers/sitemapController.js';

const router = Router();

router.get('/sitemap.xml', getSitemapXml);

export default router;
