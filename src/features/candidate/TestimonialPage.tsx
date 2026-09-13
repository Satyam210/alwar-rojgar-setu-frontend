import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCandidateProfile, useSubmitTestimonial } from './queries';
import { apiErrorMessage } from '@/lib/errors';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import { LoadingState } from '@/components/common/States';

const SUGGESTIONS_EN = [
  'This platform helped me find a job near Alwar quickly and completely free.',
  'I got placed in a company within 3 months. Very helpful and easy to use.',
  'I found a permanent job close to home through this platform. My family is very happy.',
  'After trying many places, I finally found a job near Alwar here. Salary is also good now.',
  'This platform connected me directly with an employer. The process was simple and straightforward.',
];

const SUGGESTIONS_HI = [
  'इस प्लेटफ़ॉर्म से मुझे अलवर के पास जल्दी और बिल्कुल मुफ़्त नौकरी मिली।',
  'मुझे 3 महीने में एक कंपनी में नौकरी मिल गई। बहुत मददगार और आसान प्लेटफ़ॉर्म है।',
  'इस प्लेटफ़ॉर्म से मुझे घर के पास ही स्थायी नौकरी मिली। मेरा पूरा परिवार खुश है।',
  'कई जगह कोशिश के बाद यहाँ से अलवर के पास नौकरी मिली। अब वेतन भी अच्छा है।',
  'इस प्लेटफ़ॉर्म ने सीधे नियोक्ता से जोड़ा। प्रक्रिया सरल और स्पष्ट थी।',
];

export function CandidateTestimonialPage() {
  const { t, i18n } = useTranslation(['candidate', 'common']);
  usePageTitle(t('candidate:testimonial.title'));

  const { data: profile, isLoading } = useCandidateProfile();
  const submitMutation = useSubmitTestimonial();

  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const suggestions = i18n.language === 'hi' ? SUGGESTIONS_HI : SUGGESTIONS_EN;

  async function handleSubmit() {
    if (!body.trim()) {
      setFormError(t('candidate:testimonial.errorRequired'));
      return;
    }
    setFormError('');
    try {
      await submitMutation.mutateAsync({ body: body.trim() });
      setSubmitted(true);
      toast.success(t('candidate:testimonial.submitted'));
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  }

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="mb-1">{t('candidate:testimonial.title')}</h1>
        <p className="text-sm text-content-muted">{t('candidate:testimonial.subtitle')}</p>
      </div>

      {submitted ? (
        <Card>
          <CardBody className="flex flex-col gap-3 py-8 text-center">
            <p className="text-2xl">🎉</p>
            <p className="font-semibold text-content">{t('candidate:testimonial.successTitle')}</p>
            <p className="text-sm text-content-muted">{t('candidate:testimonial.successBody')}</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="flex flex-col gap-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-content-muted mb-1">
                  {t('candidate:testimonial.yourName')}
                </p>
                <p className="text-sm font-medium text-content">{profile?.fullName ?? '—'}</p>
              </div>
              {profile?.itiTrade && (
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-content-muted mb-1">
                    {t('candidate:testimonial.yourTrade')}
                  </p>
                  <p className="text-sm font-medium text-content">{profile.itiTrade}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-content-muted mb-2">
                {t('candidate:testimonial.suggestionsLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBody(s)}
                    className="rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs text-brand-800 hover:bg-brand-100 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Field label={t('candidate:testimonial.bodyLabel')} required>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder={t('candidate:testimonial.bodyPlaceholder')}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-content-muted text-right">{body.length}/500</p>
            </Field>

            {formError && (
              <p role="alert" className="text-sm text-red-600">{formError}</p>
            )}

            <p className="text-xs text-content-muted">{t('candidate:testimonial.reviewNote')}</p>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                {submitMutation.isPending
                  ? t('common:actions.saving')
                  : t('candidate:testimonial.submit')}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
