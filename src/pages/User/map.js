/*eslint-disable*/
import React from 'react';
import {Icon} from 'antd';
import styles from './Login.less';
import { formatMessage } from 'umi/locale';
export default {
  UserName: {
    props: {
      size: 'large',
      id: 'userName',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder:formatMessage({ id: 'app.login.userName' })
    },
    rules: [
      {
        required: true,
        message: formatMessage({ id: 'app.login.enter-userName' }),
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: 'Password',
      id: 'password',
      placeholder:formatMessage({ id: 'app.login.password' })
    },
    rules: [
      {
        required: true,
        message: formatMessage({ id: 'app.login.enter-password' }),
      },
    ],
  }
};
