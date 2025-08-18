// Lógica do modo manutenção (apenas mensagens do admin)

import sendMessage from "../services/sendMessage.js";
import { enable, disable, isEnabled } from '../utils/maintenance.js';

export const handleAdminMessage = async (message) => {
      // flip maintenance on/off
      if (isEnabled() && message === '0') {
        disable();
        await sendMessage(process.env.ADMIN_WHATSAPP,'✅ Modo manutenção desligado');
      } else if (!isEnabled() && message === '1') {
        enable();
        await sendMessage(process.env.ADMIN_WHATSAPP,'⚠️  Modo manutenção ligado');
      } else {
        await sendMessage(process.env.ADMIN_WHATSAPP,`Modo manutenção está: ${isEnabled() ? '⚠️ ON.\n*Digite "0" para desativar.*' : '✅ OFF.\n*Digite "1" para ativar.*'}`);
      }
}