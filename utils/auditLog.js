const { AuditLogs, AuditLogItems } = require("../models");

const createAuditLog = async ({
  action,
  target_table,
  target_id,
  user_id,
  items_count,
  field_name,
  old_value,
  new_value,
  req,
}) => {
  try {
    const auditLog = await AuditLogs.create({
      action,
      target_table,
      target_id,
      user_id,
      items_count,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    const auditLogItems = await AuditLogItems.create({
      audit_log_id: auditLog.id,
      field_name,
      old_value,
      new_value,
      action,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = createAuditLog;
