import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { useCVStore } from '@/store'
import { type PersonalInfoSection } from '@/schemas/cv'
import { FormField, FieldInput } from './FormField'

type Props = Readonly<{ section: PersonalInfoSection }>

export function PersonalInfoEditor({ section }: Props) {
  const updateSection = useCVStore((s) => s.updateSection)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonalInfoSection>({
    defaultValues: section,
  })

  // Reset form when a different section is selected
  useEffect(() => { reset(section) }, [section.id, reset])

  function onBlurSave() {
    handleSubmit((data) => updateSection(section.id, data))()
  }

  return (
    <form className="space-y-3" onBlur={onBlurSave} aria-label="Edit personal info">
      <FormField label="Full name" htmlFor="pi-name" error={errors.name?.message}>
        <FieldInput id="pi-name" {...register('name')} error={!!errors.name} placeholder="Your Name" />
      </FormField>
      <FormField label="Email" htmlFor="pi-email" error={errors.email?.message}>
        <FieldInput id="pi-email" type="email" {...register('email')} error={!!errors.email} placeholder="you@example.com" />
      </FormField>
      <FormField label="Phone" htmlFor="pi-phone">
        <FieldInput id="pi-phone" {...register('phone')} placeholder="+1 555 000 0000" />
      </FormField>
      <FormField label="Location" htmlFor="pi-location">
        <FieldInput id="pi-location" {...register('location')} placeholder="City, Country" />
      </FormField>
      <FormField label="Website" htmlFor="pi-website">
        <FieldInput id="pi-website" {...register('website')} placeholder="https://yoursite.com" />
      </FormField>
      <FormField label="LinkedIn" htmlFor="pi-linkedin">
        <FieldInput id="pi-linkedin" {...register('linkedin')} placeholder="linkedin.com/in/you" />
      </FormField>
    </form>
  )
}
