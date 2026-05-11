
CREATE POLICY "Invitees can self-register referral" ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = invitee_id AND referrer_id <> auth.uid());
