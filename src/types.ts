export interface Link {
  text: string
  link: string
}

export interface ClassInfo {
  title: string
  method?: string
  modules: Link[]
  moduleTitles?: string[]
  location?: string | Link
  alternativeTimes?: Link
  notes?: string[]
  link?: Link[]
  duration: number
  teachers?: string[]
  time: Date
}
