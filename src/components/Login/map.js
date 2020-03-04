import React from 'react';
import { Icon } from 'antd';
import styles from './index.less';

export default {
  UserName: {
    props: {
      size: 'large',
      id: 'userName',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: '登录名',
    },
    rules: [
      {
        required: true,
        message: '请输入登录名',
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: 'Password.js',
      id: 'Password.js',
      placeholder: '密码',
    },
    rules: [
      {
        required: true,
        message: '请输入密码',
      },
    ],
  }
};
