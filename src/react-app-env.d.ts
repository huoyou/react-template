/* eslint-disable @typescript-eslint/no-explicit-any */

// 允许在ts中使用import styles from '*.less'
declare module '*.less' {
  const styles: any;
  export = styles;
}
