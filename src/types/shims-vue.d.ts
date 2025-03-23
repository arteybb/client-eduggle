declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/components/quiz/QuizDetail.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/api/user/quiz.api' {
  import type { Quiz, QuizAttempt, QuizSubmission } from '@/types/quiz'

  export function getQuizzesByCourse(courseId: string): Promise<Quiz[]>
  export function getQuizById(quizId: string): Promise<Quiz>
  export function submitQuizAttempt(attemptData: QuizSubmission): Promise<QuizAttempt>
  export function getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>
  export function getQuizAttempts(quizId: string): Promise<QuizAttempt[]>
  export function getIsPublicQuiz(quizId: string)
  export function getQuizAttemptStatus(courseId: string, quizId: string)

}
