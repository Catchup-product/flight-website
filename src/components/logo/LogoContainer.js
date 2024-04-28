import React from 'react';
import styles from "./LogoContainer.module.css";

const LogoContainer = () => {
  return (
    <div className={styles.logocontainer}>
        <img src="/logoweb.png" alt="Logo" />
        <div>Embaq</div>
    </div>
  )
}

export default LogoContainer;
