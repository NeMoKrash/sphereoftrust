import { createContext, useContext, useMemo, useState } from 'react'

const SurveyContext = createContext(null)

export function SurveyProvider({ children }) {
  const [student, setStudent] = useState({ city: '', school: '', grade: '' })
  const [answers, setAnswers] = useState({})

  const value = useMemo(
    () => ({
      student,
      setStudent,
      answers,
      answerQuestion: (questionId, score) =>
        setAnswers((prev) => ({ ...prev, [questionId]: score })),
      resetSurvey: () => setAnswers({}),
    }),
    [student, answers]
  )

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
}

export function useSurvey() {
  const ctx = useContext(SurveyContext)
  if (!ctx) throw new Error('useSurvey должен использоваться внутри SurveyProvider')
  return ctx
}
