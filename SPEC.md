# Web Physics Simulation SPEC

## 目的

小さなロボットが揺れる円盤の上を移動したとき、円盤がどのように傾き、揺れ、減衰するかをWeb上で簡易シミュレーションする。

初期フェーズでは、厳密な構造解析ではなく、展示・作品アイデアの挙動検証を目的とする。

## 技術構成

* Vite
* React
* TypeScript
* React Three Fiber
* Drei
* @react-three/rapier
* Leva

## シミュレーション対象

### 円盤

円盤は、中央付近で支えられた揺れる床として扱う。

* 形状: 円柱
* 物理: Dynamic RigidBody
* 衝突判定: Cylinder Collider
* 傾き: X軸・Z軸方向に傾く
* Y軸回転は基本的に不要
* 復元力: バネ・ダンパーによって水平に戻る

### ロボット

ロボットは、初期フェーズでは「自走ロボット」ではなく「円盤上を移動する重り」として扱う。

* 形状: 箱または低い円柱
* 物理: Dynamic RigidBody
* 移動方式: スクリプトで位置または速度を制御
* 車輪やモーターの再現は初期版では行わない

## 実装方針

### フェーズ1: 最小構成

以下を実装する。

* 円盤を表示する
* ロボットを表示する
* 円盤に物理挙動を与える
* ロボットを円盤上で移動させる
* ロボットの移動に応じて円盤が傾く
* 円盤がバネ・ダンパーで水平に戻る

### フェーズ2: パラメータ調整

Levaで以下を調整可能にする。

#### 円盤

* 半径
* 厚み
* 質量
* 復元力
* 減衰
* 摩擦

#### ロボット

* 質量
* 移動速度
* 移動半径
* 移動パターン

#### 物理

* 重力
* 摩擦
* バウンド
* シミュレーション速度

### フェーズ3: 可視化

以下を表示する。

* ロボットの軌跡
* 円盤の傾き角度
* 中心線
* 重心位置
* 傾き方向ベクトル

## 移動パターン

初期版では以下を用意する。

* 円運動
* 左右往復
* 8の字運動
* ランダムウォーク

## 画面構成

```txt
画面中央: 3Dシミュレーション
右側: パラメータUI
左下: 傾き角度の数値表示
```

## ディレクトリ構成

```txt
src/
  main.tsx
  App.tsx
  components/
    Scene.tsx
    Disk.tsx
    Robot.tsx
    Ground.tsx
    Camera.tsx
    DebugHelpers.tsx
  hooks/
    useRobotMotion.ts
    useDiskStabilizer.ts
  stores/
    simulationStore.ts
  utils/
    math.ts
```

## 主要コンポーネント

### Scene.tsx

3D空間全体を管理する。

* Canvas
* Physics
* Lights
* Camera
* Disk
* Robot
* DebugHelpers

### Disk.tsx

円盤を描画し、物理挙動を持たせる。

### Robot.tsx

ロボットを描画し、移動制御を行う。

### useDiskStabilizer.ts

円盤に復元トルクを与える。

```ts
torque.x = -rotation.x * spring - angularVelocity.x * damping
torque.z = -rotation.z * spring - angularVelocity.z * damping
```

### useRobotMotion.ts

ロボットの移動パターンを計算する。

## 初期パラメータ

```ts
const initialParams = {
  disk: {
    radius: 2,
    thickness: 0.12,
    mass: 5,
    spring: 20,
    damping: 3,
    friction: 0.8,
  },
  robot: {
    width: 0.25,
    height: 0.12,
    depth: 0.25,
    mass: 0.3,
    speed: 1,
    pathRadius: 1.2,
  },
  physics: {
    gravity: -9.81,
  },
}
```

## 注意点

このシミュレーションは、実物の構造強度や材料のたわみを正確に求めるものではない。

正確に検証できないもの:

* 円盤のたわみ
* 支持構造の強度
* 材料破壊
* 実際のモーター挙動
* タイヤと床の厳密な摩擦
* toioなど実機ロボットの制御特性

検証できるもの:

* ロボット位置による円盤の傾き傾向
* 揺れのスピード感
* 復元力の強弱による印象
* 複数の移動パターンによる見え方
* 展示作品としての動きの方向性

## 完了条件

簡易版の完了条件は以下。

* ブラウザ上で3D表示できる
* 円盤が傾く
* ロボットが円盤上を移動する
* ロボット移動に応じて円盤が揺れる
* パラメータをGUIで変更できる
* コード上で移動パターンを切り替えられる
