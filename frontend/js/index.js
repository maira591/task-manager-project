import { login } from './modules/login.js';
import { userModule } from './modules/users.js';
import { dashboard } from './modules/dashboard.js';
import { navigationModule } from './modules/navigation.js';

function mainApp() {
  login();
  userModule();
  dashboard();
  navigationModule();
}

mainApp();
