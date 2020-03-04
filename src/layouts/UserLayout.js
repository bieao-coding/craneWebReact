/*eslint-disable*/
import React, { Fragment } from 'react';
import { Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import SelectLang from '@/components/SelectLang';
import styles from './UserLayout.less';
import linLogo from '../assets/linLogo.png';
import logo from '../assets/logo.png';
import singaporeLogo from '../assets/singapore.png';
import info from '@/defaultInfo';
import { connect } from 'dva';
@connect(({ user }) => ({
  user,
}))
class UserLayout extends React.PureComponent {
  // @TODO title
  // getPageTitle() {
  //   const { routerData, location } = this.props;
  //   const { pathname } = location;
  //   let title = 'Ant Design Pro';
  //   if (routerData[pathname] && routerData[pathname].name) {
  //     title = `${routerData[pathname].name} - Ant Design Pro`;
  //   }
  //   return title;
  // }
  state = {
    javaVersion:''
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'user/getJavaVersion',
      callback:(res)=>{
        if(res){
          this.setState({javaVersion:res.versionName})
        }
      }
    });
  }

  render() {
    const { children } = this.props;
    const {isLin,isSingapore} = info;
    const copyright = (
      <Fragment>
        Copyright <Icon type="copyright" /> {`2018-2019 ${info.isSingapore ? 'ZLX' : (info.isLin ? '林丰电子' : 'SADA & ZLX')}（v：2.3.49/${this.state.javaVersion}）`}
      </Fragment>
    );
    return (
      // @TODO <DocumentTitle title={this.getPageTitle()}>
      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <img alt="logo" className={isSingapore ? styles.singaporeLogo : styles.logo} src={isSingapore ? singaporeLogo : (isLin ? linLogo : logo)} />
            </div>
          </div>
          {children}
        </div>
        <GlobalFooter copyright={copyright} />
      </div>
    );
  }
}

export default UserLayout;
