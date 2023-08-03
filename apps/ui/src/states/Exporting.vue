<template>
  <div class="exporting">
    <div class="cube-grid">
      <div class="cube cube1"></div>
      <div class="cube cube2"></div>
      <div class="cube cube3"></div>
      <div class="cube cube4"></div>
      <div class="cube cube5"></div>
      <div class="cube cube6"></div>
      <div class="cube cube7"></div>
      <div class="cube cube8"></div>
      <div class="cube cube9"></div>
    </div>

    <h4>
      Exporting assets to Github.
    </h4>
  </div>
</template>

<style lang="scss" scoped>
.exporting {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  text-align: center;
  background-color: rgb(0 0 0 / 85%);

  .cube-grid {
    width: 40px;
    height: 40px;
  }

  .cube-grid .cube {
    float: left;
    width: 33%;
    height: 33%;
    background-color: #fff;
    animation: scale-delay 1.3s infinite ease-in-out;
  }

  .cube-grid .cube1 {
    animation-delay: 0.2s;
  }

  .cube-grid .cube2 {
    animation-delay: 0.3s;
  }

  .cube-grid .cube3 {
    animation-delay: 0.4s;
  }

  .cube-grid .cube4 {
    animation-delay: 0.1s;
  }

  .cube-grid .cube5 {
    animation-delay: 0.2s;
  }

  .cube-grid .cube6 {
    animation-delay: 0.3s;
  }

  .cube-grid .cube7 {
    animation-delay: 0s;
  }

  .cube-grid .cube8 {
    animation-delay: 0.1s;
  }

  .cube-grid .cube9 {
    animation-delay: 0.2s;
  }

  @keyframes scale-delay {
    0%, 70%, 100% {
      transform: scale3d(1, 1, 1);
    }

    35% {
      transform: scale3d(0, 0, 1);
    }
  }

  @keyframes scale-delay {
    0%, 70%, 100% {
      transform: scale3d(1, 1, 1);
    }

    35% {
      transform: scale3d(0, 0, 1);
    }
  }
}
</style>
