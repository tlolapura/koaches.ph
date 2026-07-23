"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import { updateCoachContactAction } from "@/lib/koaches/actions/coach-profile";
import { invalidateCoachProfile } from "@/lib/koaches/queries/invalidate";
import { displayFacebook, displayInstagram } from "@/lib/koaches/social-links";
import { FacebookIcon, InstagramIcon } from "@/components/koaches/shared/SocialIcons";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

const CONTACT_FORM_ID = "coach-contact-form";

type CoachContactSocialsCardProps = {
  coachId: string;
  coach: CoachProfile;
  onSaved?: () => void;
};

export function CoachContactSocialsCard({ coachId, coach, onSaved }: CoachContactSocialsCardProps) {
  const { showToast } = useCoachToast();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMobile(coach.mobile ?? "");
    setInstagram(coach.instagram ?? "");
    setFacebook(coach.facebook ?? "");
  }, [coach.mobile, coach.instagram, coach.facebook]);

  const hasAny = Boolean(coach.mobile || coach.instagram || coach.facebook);

  return (
    <>
      <div className="coach-card mt-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading font-semibold">Contact & socials</p>
            <p className="mt-1 text-sm text-[#6B7280]">Shown on your public profile</p>
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-[#4F8FF7]"
            onClick={() => setOpen(true)}
          >
            Edit
          </button>
        </div>

        {hasAny ? (
          <ul className="mt-4 space-y-2.5 text-sm">
            {coach.mobile ? (
              <li className="flex items-center gap-2.5 text-[#374151]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4]">
                  <Phone className="h-4 w-4 text-[#166534]" />
                </span>
                {coach.mobile}
              </li>
            ) : null}
            {coach.instagram ? (
              <li className="flex items-center gap-2.5 text-[#374151]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4]">
                  <InstagramIcon className="text-[#166534]" />
                </span>
                {displayInstagram(coach.instagram)}
              </li>
            ) : null}
            {coach.facebook ? (
              <li className="flex items-center gap-2.5 text-[#374151]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0FDF4]">
                  <FacebookIcon className="text-[#166534]" />
                </span>
                {displayFacebook(coach.facebook)}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#9CA3AF]">
            Add your phone and social links so students can reach you.
          </p>
        )}
      </div>

      <CoachBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Contact & socials"
        subtitle="Shown on your public coach page"
        footer={
          <CoachSheetFooter>
            <CoachButton type="submit" form={CONTACT_FORM_ID} loading={saving} loadingLabel="Saving…">
              Save
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <form
          id={CONTACT_FORM_ID}
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await updateCoachContactAction(coachId, { mobile, instagram, facebook });
              invalidateCoachProfile(coachId);
              onSaved?.();
              showToast("Contact info updated!");
              setOpen(false);
            } catch (err) {
              showToast(err instanceof Error ? err.message : "Could not save contact info", "error");
            } finally {
              setSaving(false);
            }
          }}
        >
          <CoachSheetField label="Mobile" hint="For calls and Viber">
            <input
              className="coach-input"
              type="tel"
              placeholder="09XX XXX XXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </CoachSheetField>
          <CoachSheetField label="Instagram" hint="@handle or profile URL">
            <input
              className="coach-input"
              placeholder="@coachhandle"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </CoachSheetField>
          <CoachSheetField label="Facebook" hint="Profile URL or page name">
            <input
              className="coach-input"
              placeholder="facebook.com/yourpage"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
          </CoachSheetField>
        </form>
      </CoachBottomSheet>
    </>
  );
}
