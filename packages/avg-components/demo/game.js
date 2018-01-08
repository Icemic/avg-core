import { React, Component, core, components, findPixiNode, Surface } from 'avg-core';
import Image from '../src/lib/image';
import Container from '../src/lib/container';
import Layer from '../src/lib/layer';
import RichText from '../src/lib/richtext';
import Text from '../src/lib/text';
import Animation from '../src/lib/animation';
import Button from '../src/lib/button';

// const { Surface } = components;

class Stage extends Component {
  static propTypes = {
    children: React.PropTypes.any
  }
  render() {
    return (
      <Surface>
        {this.props.children}
      </Surface>
    );
  }
}

export default class Game extends Component {
  state = {
  }
  componentDidMount() {
  }
  handleClick = (e) => {
    const node = findPixiNode(this.video);
    const node2 = findPixiNode(this.video2);
    node.texture.baseTexture.source.play();
    node2.texture.baseTexture.source.play();
  }
  render() {
    return (
      <Stage>
        {/* <Image position={[0, 0]} src='video/big-buck-bunny_trailer.webm' ref={ref => (this.video2 = ref)} onTap={this.handleClick}/> */}
        <Image src='100x100.png' />
        <Container position={[120, 0]}>
          <Layer width={100} height={100} fillColor={0xffffff} fillAlpha={0.6} clip={true}>
            <Text text={'Text 测试'} position={[23, 0]} />
          </Layer>
          <RichText text={'Text 测试'} style={{ fillColor: 'white', fontSize: 26 }} layout={{ gridSize: 26 }} position={[0, 30]} />
        </Container>
        <Button position={[300, 120]} frames={['animation.png', 8, 1]} />
        <Animation position={[0, 120]} frames={['animation.png', 8, 1]} loop={true} playing={true} speed={0.125} />
        <Animation position={[0, 120]} frames={['break.png', 16, 1]} bounce={true} loop={true} playing={true} speed={0.3} />
        {/* <Image position={[0, 0]} src='video/soccer1.webm' ref={ref => (this.video = ref)} onTap={this.handleClick}/> */}
        {/* <Animation position={[0, 300]} frames={[1,2,3,4,5,6].map(item => `木头人/${item}.png`)} loop={true} playing={true} speed={0.2} /> */}
      </Stage>
    );
  }
}




