import { api } from '@/lib/axios'
import { convertTimeStringToMinutes } from '@/utils/convert-time-minutes-string'
import { getWeekDays } from '@/utils/get-week-days'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Container, FormError, Header } from '../styles'
import {
  IntervalBox,
  IntervalContainer,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
} from './styles'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa pelo menos selecionar um dia na semana.',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término déve ser pelo menos 1 hora distante do início.',
      },
    ),
})

type TimeIntervalsFormDataInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormDataOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormDataInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const { fields } = useFieldArray({
    name: 'intervals',
    control,
  })

  const intervals = watch('intervals')

  const weekDays = getWeekDays()

  const router = useRouter()

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormDataOutput

    await api.post('/users/time-intervals', { intervals })
    await router.push('/register/update-profile')
  }

  return (
    <>
      <NextSeo title="Atualize o seu perfil | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Quase lá</Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia
            da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />

          <IntervalBox
            as="form"
            onSubmit={handleSubmit(handleSetTimeIntervals)}
          >
            <IntervalContainer>
              {fields.map((field, index) => {
                return (
                  <IntervalItem key={field.id}>
                    <IntervalDay>
                      <Controller
                        control={control}
                        name={`intervals.${index}.enabled`}
                        render={({ field }) => {
                          return (
                            <Checkbox
                              onCheckedChange={(checked) => {
                                field.onChange(checked === true)
                              }}
                              checked={field.value}
                            />
                          )
                        }}
                      />
                      <Text>{weekDays[field.weekDay]}</Text>
                    </IntervalDay>
                    <IntervalInputs>
                      <TextInput
                        size="sm"
                        type="time"
                        step={60}
                        {...register(`intervals.${index}.startTime`)}
                        disabled={!intervals[index].enabled}
                      />
                      <TextInput
                        size="sm"
                        type="time"
                        step={60}
                        {...register(`intervals.${index}.endTime`)}
                        disabled={!intervals[index].endTime}
                      />
                    </IntervalInputs>
                  </IntervalItem>
                )
              })}
            </IntervalContainer>
            {errors.intervals && (
              <FormError size="sm">{errors.intervals.message}</FormError>
            )}

            <Button type="submit" disabled={isSubmitting}>
              Próximo passo <ArrowRight />
            </Button>
          </IntervalBox>
        </Header>
      </Container>
    </>
  )
}
