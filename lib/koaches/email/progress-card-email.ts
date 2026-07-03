import {
  absoluteProgressCardUrl,
  countSkillImprovements,
  formatProgressCardSessionDetail,
  getProgressCardRatings,
} from "@/lib/koaches/progress-cards";
import {
  buildSkillChanges,
  scoreLabel,
  scoreLabelsForSkill,
  sessionProgressHeadline,
  summarizeSkillChanges,
  type SkillChange,
} from "@/lib/koaches/skill-progress-display";
import { SITE_NAME } from "@/lib/koaches/site-metadata";
import type { ProgressCard } from "@/lib/koaches/types";

const BRAND = {
  green: "#16A34A",
  greenDark: "#14532D",
  greenLight: "#F0FDF4",
  greenBorder: "#BBF7D0",
  blue: "#4F8FF7",
  blueLight: "#EFF6FF",
  blueBorder: "#DBEAFE",
  gray: "#6B7280",
  grayBorder: "#E5E7EB",
  red: "#B91C1C",
  redLight: "#FFFBFB",
  redBorder: "#FECACA",
  text: "#111827",
  muted: "#9CA3AF",
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailStarRow(score: number, color: string): string {
  const filled = Math.round(Math.min(5, Math.max(0, score)));
  const empty = 5 - filled;
  return `<span style="color:${color};font-size:13px;letter-spacing:1px;line-height:1;">${"&#9679;".repeat(filled)}${"&#9675;".repeat(empty)}</span>`;
}

function emailBrandHeader(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:0 0 20px;">
          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:700;line-height:1;letter-spacing:-0.02em;">
            <span style="color:${BRAND.green};">Pickle</span><span style="color:${BRAND.blue};">Koach</span>
          </span>
        </td>
      </tr>
    </table>`;
}

function emailFeedbackBlock(
  label: string,
  body: string,
  colors: { label: string; bg: string; border: string }
): string {
  const text = body.trim();
  if (!text) return "";
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
      <tr>
        <td style="padding:14px 16px;border-radius:16px;background:${colors.bg};border:1px solid ${colors.border};">
          <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${colors.label};">${escapeHtml(label)}</p>
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.55;color:#374151;white-space:pre-wrap;">${escapeHtml(text)}</p>
        </td>
      </tr>
    </table>`;
}

function emailSkillRow(change: SkillChange, leveledUp: boolean): string {
  const labels = scoreLabelsForSkill(change.skillId, change.category);
  const beforeText = scoreLabel(change.before, labels);
  const afterText = scoreLabel(change.after, labels);
  const sameLabel = beforeText === afterText;
  const border = leveledUp ? BRAND.greenBorder : BRAND.grayBorder;
  const bg = leveledUp ? BRAND.greenLight : "#FFFFFF";

  const deltaBadge =
    change.delta > 0
      ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#DCFCE7;color:#166534;font-size:10px;font-weight:700;">+${change.delta}</span>`
      : change.delta < 0
        ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#FEE2E2;color:#B91C1C;font-size:10px;font-weight:700;">${change.delta}</span>`
        : "";

  const scoreSummary = sameLabel
    ? `<span style="font-weight:600;color:#374151;">${escapeHtml(afterText)}</span>`
    : `<span style="color:#93C5FD;">${escapeHtml(beforeText)}</span> &rarr; <span style="font-weight:600;color:#166534;">${escapeHtml(afterText)}</span>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      <tr>
        <td style="padding:14px 16px;border-radius:16px;background:${bg};border:1px solid ${border};">
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:600;line-height:1.4;color:${BRAND.text};">
            ${escapeHtml(change.skillName)}${deltaBadge}
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;">
            <tr>
              <td width="50%" style="padding-right:6px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:${BRAND.gray};">Before</p>
                ${emailStarRow(change.before, "#14532D")}
              </td>
              <td width="50%" style="padding-left:6px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#166534;">After</p>
                ${emailStarRow(change.after, BRAND.green)}
              </td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;line-height:1.4;color:${BRAND.gray};text-align:center;">
            ${scoreSummary}
          </p>
        </td>
      </tr>
    </table>`;
}

function emailSkillSection(
  title: string,
  changes: SkillChange[],
  options: { titleColor: string; bg: string; border: string; leveledUp?: boolean }
): string {
  if (changes.length === 0) return "";
  const rows = changes.map((change) => emailSkillRow(change, options.leveledUp ?? false)).join("");
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
      <tr>
        <td style="padding:12px 14px;border-radius:16px;background:${options.bg};border:1px solid ${options.border};">
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:${options.titleColor};">
            ${escapeHtml(title)} (${changes.length})
          </p>
          ${rows}
        </td>
      </tr>
    </table>`;
}

function buildProgressCardEmailBody(card: ProgressCard): string {
  const sessionDetail = formatProgressCardSessionDetail(card);
  const { before, after } = getProgressCardRatings(card);
  const changes = buildSkillChanges(before, after);
  const { improved, same, slipped } = summarizeSkillChanges(changes);
  const headline = sessionProgressHeadline(changes);
  const skillCount = after.length;
  const improvedCount = countSkillImprovements(before, after);

  const sessionDetailHtml = sessionDetail
    ? `<p style="margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:${BRAND.gray};">${escapeHtml(sessionDetail)}</p>`
    : "";

  const strengths = emailFeedbackBlock("Strengths", card.coachStrengths ?? "", {
    label: "#166534",
    bg: BRAND.greenLight,
    border: BRAND.greenBorder,
  });
  const toImprove = emailFeedbackBlock("To improve", card.coachToImprove ?? "", {
    label: BRAND.red,
    bg: BRAND.redLight,
    border: BRAND.redBorder,
  });
  const coachNote = card.coachMessage.trim()
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
        <tr>
          <td style="padding:14px 16px;border-radius:16px;background:#FCFCFD;border:1px solid ${BRAND.grayBorder};">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.gray};">Coach note</p>
            <p style="margin:0;font-size:14px;line-height:1.55;color:#374151;font-style:italic;">&ldquo;${escapeHtml(card.coachMessage.trim())}&rdquo;</p>
            <p style="margin:10px 0 0;font-size:12px;font-weight:600;color:${BRAND.muted};">&mdash; ${escapeHtml(card.coachName)}</p>
          </td>
        </tr>
      </table>`
    : "";

  const skillSections =
    skillCount > 0
      ? `
        ${emailSkillSection("Leveled up", improved, {
          titleColor: "#166534",
          bg: "#F8FFF9",
          border: "#DCFCE7",
          leveledUp: true,
        })}
        ${emailSkillSection(improved.length > 0 ? "Also worked on" : "Skills worked on", same, {
          titleColor: BRAND.gray,
          bg: "#FCFCFD",
          border: BRAND.grayBorder,
        })}
        ${emailSkillSection("Focus next session", slipped, {
          titleColor: BRAND.red,
          bg: BRAND.redLight,
          border: BRAND.redBorder,
        })}
        <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;line-height:1.5;color:${BRAND.muted};text-align:center;">
          Rating scale: 0 = not introduced &middot; 5 = competition-ready
        </p>`
      : `<p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:${BRAND.gray};text-align:center;">Great effort today — keep building session by session.</p>`;

  return `
    ${emailBrandHeader()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:20px;border:1px solid ${BRAND.grayBorder};overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 20px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.green};">Session progress</p>
          <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;line-height:1.2;color:${BRAND.text};">${escapeHtml(card.studentName)}</h1>
          <p style="margin:6px 0 0;font-size:14px;color:${BRAND.gray};">Coached by ${escapeHtml(card.coachName)}</p>
          <p style="margin:12px 0 0;">
            <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${BRAND.green};color:#FFFFFF;font-size:12px;font-weight:700;">${escapeHtml(card.programName)}</span>
          </p>
          ${sessionDetailHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:18px 16px;border-radius:16px;background:${BRAND.blueLight};border:1px solid ${BRAND.blueBorder};text-align:center;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;line-height:1.3;color:${BRAND.greenDark};">${escapeHtml(headline)}</p>
                <p style="margin:8px 0 0;font-size:13px;color:${BRAND.gray};">
                  ${skillCount} skill${skillCount !== 1 ? "s" : ""} covered this session
                  ${skillCount > 0 ? ` &middot; ${improvedCount} improved` : ""}
                </p>
              </td>
            </tr>
          </table>
          ${strengths}
          ${toImprove}
          ${coachNote}
          ${skillSections}
        </td>
      </tr>
    </table>`;
}

export function buildProgressCardEmailSubject(card: ProgressCard): string {
  return `${card.studentName}, your progress from ${card.coachName}`;
}

export function buildProgressCardEmailHtml(card: ProgressCard): string {
  const url = absoluteProgressCardUrl(card.id);
  const cardBody = buildProgressCardEmailBody(card);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(buildProgressCardEmailSubject(card))}</title>
  </head>
  <body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND.text};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5;color:${BRAND.gray};text-align:center;">
                Hi ${escapeHtml(card.studentName)}, here is your progress card from ${escapeHtml(card.coachName)}.
              </td>
            </tr>
            <tr>
              <td>${cardBody}</td>
            </tr>
            <tr>
              <td style="padding:24px 8px 8px;text-align:center;">
                <a href="${url}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${BRAND.green};color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;">Open interactive card</a>
                <p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};">
                  Share or save from the web version<br />
                  <a href="${url}" style="color:${BRAND.green};word-break:break-all;">${escapeHtml(url)}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 8px 0;text-align:center;font-size:12px;font-weight:600;color:${BRAND.muted};">
                Powered by ${escapeHtml(SITE_NAME)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function formatSkillChangeText(change: SkillChange): string {
  const labels = scoreLabelsForSkill(change.skillId, change.category);
  const beforeText = scoreLabel(change.before, labels);
  const afterText = scoreLabel(change.after, labels);
  const delta = change.delta > 0 ? ` (+${change.delta})` : change.delta < 0 ? ` (${change.delta})` : "";
  return `- ${change.skillName}: ${beforeText} → ${afterText}${delta}`;
}

export function buildProgressCardEmailText(card: ProgressCard): string {
  const url = absoluteProgressCardUrl(card.id);
  const sessionDetail = formatProgressCardSessionDetail(card);
  const { before, after } = getProgressCardRatings(card);
  const changes = buildSkillChanges(before, after);
  const { improved, same, slipped } = summarizeSkillChanges(changes);
  const headline = sessionProgressHeadline(changes);

  const lines = [
    `Hi ${card.studentName},`,
    "",
    `${card.coachName} shared your progress card on ${SITE_NAME}.`,
    "",
    `${card.studentName} · ${card.programName}`,
    sessionDetail ?? "",
    "",
    headline,
    "",
  ];

  if (card.coachStrengths?.trim()) lines.push(`Strengths: ${card.coachStrengths.trim()}`, "");
  if (card.coachToImprove?.trim()) lines.push(`To improve: ${card.coachToImprove.trim()}`, "");
  if (card.coachMessage.trim()) lines.push(`Coach note: "${card.coachMessage.trim()}" — ${card.coachName}`, "");

  if (improved.length > 0) {
    lines.push("Leveled up:", ...improved.map(formatSkillChangeText), "");
  }
  if (same.length > 0) {
    lines.push(improved.length > 0 ? "Also worked on:" : "Skills worked on:", ...same.map(formatSkillChangeText), "");
  }
  if (slipped.length > 0) {
    lines.push("Focus next session:", ...slipped.map(formatSkillChangeText), "");
  }

  lines.push(`Open interactive card: ${url}`);
  return lines.filter((line, index, all) => line !== "" || all[index - 1] !== "").join("\n");
}
