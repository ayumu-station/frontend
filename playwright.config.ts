import type { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const config: PlaywrightTestConfig = {
	// webServer: {
	// 	command: 'npm run build && npm run preview',
	// 	port: 4173
	// }
	use: {
		baseURL: 'http://justtestdomain.kro.kr:1234'
	}
};

export default config;
