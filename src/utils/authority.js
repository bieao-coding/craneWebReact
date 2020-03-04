// use localStorage to store the authority info, which might be sent from server in actual project.
/*eslint-disable*/
export function getAuthority(str) {

  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const auth = sessionStorage.getItem('Authorization');
  const role = sessionStorage.getItem('Roles');
  let authorityString = [];
  if(!!auth){
    authorityString.push(auth.substring(0,6));
    if(!!role){
      let newRole = JSON.parse(role);
      authorityString = [...authorityString,...newRole];
    }
  }
  return authorityString;
}

export function setAuthority(authority) {
  return sessionStorage.setItem('Authorization', authority);
}
