export const SERVICE_NAME_MAX_LENGTH = 100;
export const SERVICE_DESCRIPTION_MAX_LENGTH = 500;
export const SERVICE_TIME_STEP_MINUTES = 5;

export function isServiceTimeStepAligned(value: number) {
  return Number.isInteger(value) && value % SERVICE_TIME_STEP_MINUTES === 0;
}
