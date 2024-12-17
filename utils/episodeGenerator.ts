interface DisabilityStatus {
  lateness: string
  early_leaving: string
  sudden_absence: string
  leaving_during_work: string
  communication: string
  work_capability: string[]
  work_performance: string[]
}

interface Considerations {
  physical_environment: string[]
  work_considerations: string[]
  communication_support: string[]
  human_support: string[]
  health_safety: string[]
  career_development: string[]
  mental_support: string[]
}

export function generateEpisode(
  disabilityStatus: DisabilityStatus,
  considerations: Considerations
): string {
  let episode = '【就労状況】\n'

  // 勤怠に関する状況
  const attendanceIssues = []
  if (disabilityStatus.lateness !== 'まったくない') {
    attendanceIssues.push(`遅刻が${disabilityStatus.lateness}`)
  }
  if (disabilityStatus.early_leaving !== 'まったくない') {
    attendanceIssues.push(`早退が${disabilityStatus.early_leaving}`)
  }
  if (disabilityStatus.sudden_absence !== 'まったくない') {
    attendanceIssues.push(`急な休みが${disabilityStatus.sudden_absence}`)
  }
  if (disabilityStatus.leaving_during_work !== 'まったくない') {
    attendanceIssues.push(`仕事の途中で抜けることが${disabilityStatus.leaving_during_work}`)
  }

  if (attendanceIssues.length > 0) {
    episode += `勤怠面では、${attendanceIssues.join('、')}という状況です。\n`
  } else {
    episode += '勤怠面では特に問題はありません。\n'
  }

  // コミュニケーションの状況
  episode += `\n同僚とのコミュニケーションについては、${disabilityStatus.communication}です。\n`

  // 作業能力の状況
  if (disabilityStatus.work_capability.length > 0) {
    episode += `\n作業能力面では、${disabilityStatus.work_capability.join('、')}などの特徴が見られます。\n`
  }

  // 業務遂行能力の状況
  if (disabilityStatus.work_performance.length > 0) {
    episode += `\n業務遂行面では、${disabilityStatus.work_performance.join('、')}といった課題があります。\n`
  }

  // 配慮事項
  episode += '\n【配慮事項】\n'

  // 物理的環境の配慮
  if (considerations.physical_environment.length > 0) {
    episode += `物理的環境面では、${considerations.physical_environment.join('、')}などの配慮を行っています。\n`
  }

  // 作業上の配慮
  if (considerations.work_considerations.length > 0) {
    episode += `作業面で���、${considerations.work_considerations.join('、')}などの配慮を行っています。\n`
  }

  // コミュニケーション支援
  if (considerations.communication_support.length > 0) {
    episode += `コミュニケーション面では、${considerations.communication_support.join('、')}などの支援を行っています。\n`
  }

  // 人的支援
  if (considerations.human_support.length > 0) {
    episode += `人的支援として、${considerations.human_support.join('、')}を実施しています。\n`
  }

  // 健康・安全管理
  if (considerations.health_safety.length > 0) {
    episode += `健康・安全面では、${considerations.health_safety.join('、')}などの管理を行っています。\n`
  }

  // キャリア形成
  if (considerations.career_development.length > 0) {
    episode += `キャリア形成支援として、${considerations.career_development.join('、')}を実施しています。\n`
  }

  // メンタルヘルス
  if (considerations.mental_support.length > 0) {
    episode += `メンタルヘルスケアとして、${considerations.mental_support.join('、')}を行っています。\n`
  }

  return episode
} 