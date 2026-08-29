export interface DayHours {
  day: string
  open?: string
  close?: string
  closed?: boolean
}

export interface ServiceInfo {
  id: string
  name: string
  durationMin: number
}

export interface BusinessLocationInfo {
  id: string
  name: string
  description: string
  hours: DayHours[]
}

export interface BusinessInfo {
  name: string
  logoInitial: string
  description: string
  rating?: number
  whatsappNumber: string
  phoneDisplay: string
  phoneLink: string
  socials: {
    instagram?: string
    facebook?: string
  }
  locations: BusinessLocationInfo[]
  services: ServiceInfo[]
  monthlyLimitReached: boolean
}
