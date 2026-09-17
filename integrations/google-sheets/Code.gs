/**
 * ASIALUXE | TARGET | LEADS → CRM Kanban
 *
 * O'rnatish:
 * 1. Sheet → Extensions → Apps Script → shu kodni yopishtiring.
 * 2. CONFIG.CRM_URL va CONFIG.SECRET ni to'ldiring (backend SHEETS_WEBHOOK_SECRET).
 * 3. Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone)
 *    URL ni backend SHEETS_CALLBACK_URL ga qo'ying (CRM→Sheet status).
 * 4. syncAll() ni bir marta Run qiling (mavjud qatorlar).
 * 5. Triggers: Edit → onEditInstallable; Time-driven → syncAll har 1 daqiqa.
 *
 * Ustunlar (header qatori 1): M destination, N people, O name, P phone_raw, Q phone, R lead_status
 */

var CONFIG = {
  CRM_URL: "https://YOUR_BACKEND_HOST/api/v1/integrations/sheets/leads",
  SECRET: "CHANGE_ME_SAME_AS_SHEETS_WEBHOOK_SECRET",
  SHEET_NAME: "Лист1",
  HEADER_ROW: 1,
  COL: {
    destination: 13, // M
    people: 14, // N
    name: 15, // O
    phoneRaw: 16, // P
    phone: 17, // Q
    status: 18, // R
  },
};

function onEditInstallable(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== CONFIG.SHEET_NAME) return;
  var row = e.range.getRow();
  if (row <= CONFIG.HEADER_ROW) return;
  pushRows_([row]);
}

function syncAll() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;
  var last = sheet.getLastRow();
  if (last <= CONFIG.HEADER_ROW) return;
  var rows = [];
  for (var r = CONFIG.HEADER_ROW + 1; r <= last; r++) rows.push(r);
  // batch 50
  for (var i = 0; i < rows.length; i += 50) {
    pushRows_(rows.slice(i, i + 50));
    Utilities.sleep(200);
  }
}

function doPost(e) {
  // CRM → Sheet status write-back
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== CONFIG.SECRET) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "secret" }),
      ).setMimeType(ContentService.MimeType.JSON);
    }
    var ss = SpreadsheetApp.openById(body.spreadsheetId);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) throw new Error("sheet");
    var row = Number(body.row);
    var status = String(body.leadStatus || "");
    var cell = sheet.getRange(row, CONFIG.COL.status);
    if (String(cell.getValue()) !== status) {
      PropertiesService.getScriptProperties().setProperty("skipSync", "1");
      cell.setValue(status);
      PropertiesService.getScriptProperties().deleteProperty("skipSync");
    }
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function pushRows_(rowNums) {
  if (PropertiesService.getScriptProperties().getProperty("skipSync") === "1") {
    return;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;
  var sid = ss.getId();
  var leads = [];
  for (var i = 0; i < rowNums.length; i++) {
    var r = rowNums[i];
    var name = String(sheet.getRange(r, CONFIG.COL.name).getDisplayValue() || "").trim();
    if (!name) continue;
    var phone = String(sheet.getRange(r, CONFIG.COL.phone).getDisplayValue() || "").trim();
    var phoneRaw = String(
      sheet.getRange(r, CONFIG.COL.phoneRaw).getDisplayValue() || "",
    ).trim();
    leads.push({
      row: r,
      spreadsheetId: sid,
      name: name,
      phone: phone,
      phoneRaw: phoneRaw,
      destination: String(
        sheet.getRange(r, CONFIG.COL.destination).getDisplayValue() || "",
      ).trim(),
      people: String(sheet.getRange(r, CONFIG.COL.people).getDisplayValue() || "").trim(),
      leadStatus: String(
        sheet.getRange(r, CONFIG.COL.status).getDisplayValue() || "CREATED",
      ).trim(),
    });
  }
  if (!leads.length) return;
  var res = UrlFetchApp.fetch(CONFIG.CRM_URL, {
    method: "post",
    contentType: "application/json",
    headers: { "X-Sheets-Secret": CONFIG.SECRET },
    payload: JSON.stringify({ leads: leads }),
    muteHttpExceptions: true,
  });
  Logger.log(res.getResponseCode() + " " + res.getContentText());
}
