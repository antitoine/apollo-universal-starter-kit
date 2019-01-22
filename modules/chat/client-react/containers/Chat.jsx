import React from 'react';
import PropTypes from 'prop-types';
import { LayoutCenter, PageLayout } from '@module/look-client-react';
import Helmet from 'react-helmet';
import { Menu, Item, contextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

import chatConfig from '../../../../config/chat';
import { WebChat } from './webChat/WebChat';
import settings from '../../../../settings';
import CustomView from '../components/CustomView';
import ChatFooter from '../components/ChatFooter';

export default class extends React.Component {
  static propTypes = {
    // loading: PropTypes.bool.isRequired,
    t: PropTypes.func,
    messages: PropTypes.object,
    addMessage: PropTypes.func,
    deleteMessage: PropTypes.func,
    editMessage: PropTypes.func,
    // loadData: PropTypes.func.isRequired,
    currentUser: PropTypes.object,
    uuid: PropTypes.string
    // pickImage: PropTypes.func,
    // images: PropTypes.bool
  };

  state = {
    message: '',
    isEdit: false,
    messageInfo: null,
    isQuoted: false,
    quotedMessage: null,
    activeMessage: null,
    currentMessage: null
  };

  setMessageState = text => {
    this.setState({ message: text });
  };

  onLongPress = (context, currentMessage, id) => {
    context.preventDefault();

    this.setState({
      isOwnMessage: id === currentMessage.user._id,
      currentMessage,
      activeMessage: currentMessage._id === this.state.activeMessage ? null : currentMessage._id
    });

    contextMenu.show({
      id: 'menu',
      event: context
    });
  };

  onSend = (messages = []) => {
    const { isEdit, messageInfo, message, quotedMessage } = this.state;
    const { addMessage, editMessage, uuid } = this.props;
    const quotedId = quotedMessage && quotedMessage.hasOwnProperty('id') ? quotedMessage.id : null;
    const defQuote = { filename: null, path: null, text: null, username: null, id: quotedId };

    if (isEdit) {
      editMessage({
        ...messageInfo,
        text: message,
        quotedMessage: quotedMessage ? quotedMessage : defQuote,
        uuid
      });
      this.setState({ isEdit: false });
    } else {
      const {
        text = null,
        user: { _id: userId, name: username },
        _id: id
      } = messages[0];

      addMessage({
        text,
        username,
        userId,
        id,
        uuid,
        quotedId,
        quotedMessage: quotedMessage ? quotedMessage : defQuote
      });

      this.setState({ isQuoted: false, quotedMessage: null });
    }
  };

  renderCustomView = chatProps => {
    return <CustomView {...chatProps} />;
  };

  setQuotedState = ({ _id: id, text, path, filename, user: { name: username } }) => {
    this.setState({ isQuoted: true, quotedMessage: { id, text, path, filename, username } });
    this.gc.focusTextInput();
  };

  setEditState = ({ _id: id, text, createdAt, quotedId, user: { _id: userId, name: username } }) => {
    this.setState({ isEdit: true, message: text, messageInfo: { id, text, createdAt, userId, username, quotedId } });
    this.gc.focusTextInput();
  };

  renderChatFooter = () => {
    if (this.state.isQuoted) {
      const { quotedMessage } = this.state;
      return (
        <ChatFooter {...quotedMessage} undoQuote={() => this.setState({ isQuoted: false, quotedMessage: null })} />
      );
    }
  };

  renderActionSheet = () => {
    const { t, deleteMessage } = this.props;
    const { currentMessage, isOwnMessage } = this.state;
    return (
      <Menu id={'menu'}>
        <Item onClick={() => this.setQuotedState(currentMessage)}>{t('msg.btn.reply')}</Item>
        {isOwnMessage && (
          <React.Fragment>
            <Item onClick={() => this.setEditState(currentMessage)}>{t('msg.btn.edit')}</Item>
            <Item onClick={() => deleteMessage(currentMessage._id)}>{t('msg.btn.delete')}</Item>
          </React.Fragment>
        )}
      </Menu>
    );
  };

  render() {
    const { currentUser, deleteMessage, uuid, messages, t } = this.props;

    this.allowDataLoad = true;
    const { message } = this.state;
    const edges = messages ? messages.edges : [];
    const { id = uuid, username = null } = currentUser ? currentUser : {};
    return (
      <PageLayout>
        <Helmet
          title={`${settings.app.name} - ${t('title')}`}
          meta={[{ name: 'description', content: `${settings.app.name} - ${t('meta')}` }]}
        />
        <LayoutCenter>
          <h1 className="text-center">{t('title')}</h1>
          <div style={{ backgroundColor: '#eee' }}>
            <WebChat
              {...chatConfig.giftedChat}
              ref={gc => (this.gc = gc)}
              text={message}
              onInputTextChanged={text => this.setMessageState(text)}
              placeholder={t('input.text')}
              messages={edges}
              //renderSend={this.renderSend}
              onSend={this.onSend}
              //loadEarlier={messages.totalCount > messages.edges.length}
              //onLoadEarlier={this.onLoadEarlier}
              user={{ _id: id, name: username }}
              renderChatFooter={this.renderChatFooter}
              renderCustomView={this.renderCustomView}
              textInputAutoFocus
              onLongPress={(e, currentMessage) =>
                this.onLongPress(e, currentMessage, id, deleteMessage, this.setEditState)
              }
            />
            {this.renderActionSheet()}
          </div>
        </LayoutCenter>
      </PageLayout>
    );
  }
}
