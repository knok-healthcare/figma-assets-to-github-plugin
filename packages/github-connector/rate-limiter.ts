export default class RateLimiter {
  private limit
  private pool: { id: number; callback: () => unknown; status: string }[] = []

  constructor(limit = 5) {
    this.limit = limit
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  enqueue(callbackFn: Function, callbackArgs: unknown) {
    return new Promise(resolve => {
      const jobId = Math.floor(Math.random() * Date.now())

      this.pool.push({
        id: jobId,
        status: 'waiting',
        callback: async () => {
          const result = await callbackFn(callbackArgs)

          const currentJob = this.pool.find(job => job.id === jobId)
          if (currentJob) currentJob.status = 'done'

          this.reevaluatePool()

          return resolve(result)
        },
      })

      this.reevaluatePool()
    })
  }

  async reevaluatePool() {
    // Remove finished jobs from the pool
    this.pool = this.pool.filter(job => job.status !== 'done')
    console.log('pool size: ', this.pool.length)

    const jobsInProgress = this.pool.filter(job => job.status === 'in-progress')
    if (jobsInProgress.length < this.limit) {
      const availableSlots = this.limit - jobsInProgress.length
      const jobsWaiting = this.pool.filter(job => job.status === 'waiting')

      for (let index = 0; index < availableSlots; index++) {
        if (jobsWaiting[index]) {
          jobsWaiting[index].status = 'in-progress'
          jobsWaiting[index].callback()
        }
      }
    }
  }
}
