import React from 'react';
import classNames from 'classnames';
import { withRouter, Redirect, NavLink } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';

class ChannelList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {modalClosed: "", name: "", is_dm: false, userList: [], browseClosed: "", channelSelect: [], search: "", userLoading: false};
    this.closeModal = this.closeModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.addUser = this.addUser.bind(this);
    this.removeChannel = this.removeChannel.bind(this);
    this.addChannel = this.addChannel.bind(this);
    this.previewChannel = this.previewChannel.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.openDMModal = this.openDMModal.bind(this);
  }

  componentDidMount() {
    if(this.props.match.path.includes('preview') === false) {
      this.props.fetchChannels();
      // this.props.fetchUsers();
    }
    document.addEventListener('keydown', this.keydownHandler);
  }

  componentWillUnmount(){
    document.removeEventListener('keydown', this.keydownHandler);
  }

  componentWillReceiveProps(nextProps) {
    // if(nextProps.match.params.channelId !== this.props.match.params.channelId) {
    //   this.props.fetchMessages(nextProps.match.params.channelId);
    // }
  }

  closeModal(e) {
    this.props.clearErrors();
    this.setState({browseClosed: "", modalClosed: "", name: "", userList: [], is_dm: false, channelSelect: [], search: ""});
    // this.props.fetchMessages(this.props.match.params.channelId);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.clearErrors();
    if(this.state.is_dm && this.state.userList.length > 0) {

      for(var i = 0; i < this.props.directmessages.length; i++) {
        let dmUserList = this.props.directmessages[i].users.map(user => user.id);
        if(this.state.userList.concat(this.props.currentUser.id).sort().toString() === dmUserList.sort().toString()) {
          this.props.history.push(`/channels/${this.props.directmessages[i].id}`);
          this.props.fetchMessages(this.props.match.params.channelId);
          this.closeModal();
          return;
        }
      }
      this.props.createChannel({name: `dm_channel${Math.floor(Math.random() * 100000)}`, is_dm: this.state.is_dm, userList: this.state.userList}).then(() => this.closeModal()).then(() => this.props.history.push(`/channels/${parseInt(this.props.directmessages[this.props.directmessages.length - 1].id)}`));
    } else {
      this.props.createChannel({name: this.state.name, is_dm: this.state.is_dm}).then(() => this.closeModal()).then(() => this.props.history.push(`/channels/${parseInt(this.props.channels[this.props.channels.length - 1].id)}`));
    }
  }

  previewChannel(e) {
    e.preventDefault();
    this.closeModal(e);
    this.props.history.push(`/channels/${e.currentTarget.value}/preview`);
  }

  update(property) {
    return (e) => this.setState({ [property]: e.target.value });
  }

  keydownHandler(e){
    if(e.keyCode === 27) this.closeModal(e);
    if(this.state.browseClosed === 'open' || this.state.modalClosed === 'open') {
      if(e.keyCode === 13) {
        this.handleSubmit(e);
      }
    }
  }

  addUser(e) {
    e.preventDefault();
    let users = this.state.userList;
    users.push(e.target.value);
    this.setState({userList: users});
  }

  addChannel(e) {
    e.preventDefault();
    let select = [];
    select.push(e.target.value);
    this.setState({channelSelect: select});
  }

  removeChannel(e) {
    this.props.deleteChannel(parseInt(e.currentTarget.value));
  }

  removeUser(e) {
    e.preventDefault();
    let users = this.state.userList;
    this.setState({userList: users.filter(userId => userId !== e.currentTarget.value)});
  }

  openDMModal() {
    this.setState({modalClosed: 'open', is_dm: true});
    this.props.fetchUsers().then(this.setState({userLoading: false}));
  }

  render() {
    if(this.props.channel === {}) {
      return null;
    }

    let modal, modalTitle, modalButton, input, userList, selectedUsers, goButton, preview, icon;

    if(this.state.is_dm === true) {
      if(!(this.state.userList.length > 0)) {
        goButton = <button className='go-button gray' onClick={this.handleSubmit}>Go</button>;
        } else {
          goButton = <button className='go-button green' onClick={this.handleSubmit}>Go</button>;
          }
          icon = <span className="fa fa-search"></span>;
          input = <input type='text' value={this.state.search} placeholder={`Find or start a conversation`} onChange={this.update('search')}></input>;
          modalTitle = <h2 className='modal-title'>Direct Messages</h2>;
            userList = <ul className='dm-user-list'>
              {this.props.users.filter(user => (user.username.toLowerCase()).includes(this.state.search.toLowerCase())).filter(user => !user.username.startsWith('demo')).filter(user => !this.state.userList.includes(user.id)).map(user => <li key={user.id} className='user-list-li' value={user.id} onClick={this.addUser}>{user.username}</li>)}
            </ul>;
            selectedUsers = <ul className='selected-users'>
              {this.state.userList.map(id => <li className='selected-user-li' key={id} value={id} onClick={this.removeUser}><img className='selected-users-picture' src={`${this.props.users.find(user => user.id === id).image_url}`}></img><div className='selected-users-username-x'><span className='selected-users-username'>{this.props.users.find(user => user.id === id).username}</span> <span className='x'>X</span></div></li>)}
            </ul>;
          } else if(this.state.is_dm === false){
            if(!(this.state.name.length > 0)) {
              goButton = <button className='go-button gray' onClick={this.handleSubmit}>Go</button>;
              } else {
                goButton = <button className='go-button green' onClick={this.handleSubmit}>Go</button>;
                }
                icon = <i class="fa fa-hashtag" ></i>;
                input = <input ref={i => i && i.focus()} type='text' placeholder="Name" value={this.state.name} onChange={this.update('name')}></input>;
                  modalTitle = <h2 className='modal-title'>Create a new channel!</h2>;
                    modalButton = <button type='submit' className='modal-button'>Create New Channel</button>;
                    }

                    if(this.state.modalClosed === "") {
                      modal = undefined;
                    } else if(this.state.modalClosed === 'open') {

                      modal = <div className='channel-modal'>
                        <ul className='channels-errors'>{this.props.errors.map(error => <li>{error}</li>)}</ul>
                        <div className='channel-modal-form'>
                          <div className='title-and-button-dm-form'>{modalTitle}{goButton}</div>
                          {icon}
                          {input}
                          {selectedUsers}
                          <div className='channel-modal-form-innerdiv'>
                            {userList}
                          </div>
                        </div>
                        <div onClick={this.closeModal} className='close-channel-modal'>X</div>
                      </div>;
                    }

                    //browseModal
                    let browseModal;
                    if(this.state.browseClosed === "open") {

                      let selectedChannels = <ul className='selected-users'>
                        {this.state.channelSelect.map(id => <li key={id}>{this.props.allChannels.find(channel => channel.id === id).name}</li>)}
                      </ul>;

                      modalTitle = <h2 className='modal-title'>Browse Channels</h2>;

                        if(!(this.state.channelSelect.length === 1)) {
                          goButton = <button className='go-button gray' onClick={this.previewChannel}>Go</button>;
                          } else {
                            goButton = <button className='go-button green' onClick={this.previewChannel}>Go</button>;
                            }

                            browseModal = <div className='channel-modal'>
                              <div className='channel-modal-form'>
                                <div className='title-and-button-dm-form'>{modalTitle}</div>
                                <span className="fa fa-search"></span>
                                <input type='text' value={this.state.search} placeholder='Search channels' onChange={this.update('search')}></input>
                                {selectedChannels}

                                <div className='channel-modal-form-innerdiv'>
                                  <p className='channels-you-can-join-p'>Channels you can join</p>
                                  <ul>
                                    {this.props.allChannels.reverse().
                                      filter(channel => !channel.name.startsWith(`dm_channel`)).
                                      filter(channel => (channel.name.toLowerCase()).includes(this.state.search.toLowerCase())).
                                      map(channel => <li key={channel.id} value={channel.id} className='browse-channel-li' onClick={this.previewChannel}><div className='browse-inner-div'><div className='browse-hash'># <span id='browse-title'>{channel.name}</span></div>  <span>Created on {channel.created_at}</span> <div className='browse-channels-usercount'><i className="fa fa-user-o" aria-hidden="true"></i><span>{channel.userCount}</span></div><div className='browse-preview'><p>↵</p>Preview</div></div></li>)}
                                  </ul>
                                </div>
                              </div>
                              <div onClick={this.closeModal} className='close-channel-modal'>X</div>
                            </div>;
                          } else {
                            browseModal === undefined;
                          }


                          return (
                            <section className='main-left-channel-list'>
                              <CSSTransitionGroup transitionName="example" transitionEnterTimeout={0} transitionLeaveTimeout={0}>
                                {modal}
                              </CSSTransitionGroup>
                              <CSSTransitionGroup transitionName="example" transitionEnterTimeout={0} transitionLeaveTimeout={0}>
                                {browseModal}
                              </CSSTransitionGroup>
                              <div>

                                <div className='channels-header-thing'>
                                  <h1 className='channels-header-thing-h1' onClick={() => this.setState({browseClosed: 'open', is_dm: false})}>Channels</h1>
                                  <div className="channels-tooltip">Browse All Channels</div>
                                  <div
                                    className='plus-sign-create'
                                    onClick={() => this.setState({modalClosed: 'open', is_dm: false})}>
                                    <span>
                                      <i className="fa fa-plus-circle"></i>
                                    </span>
                                  </div>
                                </div>

                                <ul>
                                  {this.props.channels.map((channel,idx) =>

                                    <li className='channel-li' key={channel.id}>
                                      <NavLink to={`/channels/${channel.id}/`} className='channel-list-li' activeClassName="selected">
                                        <span>#</span> {channel.name}
                                        </NavLink>
                                      </li>
                                    )}
                                  </ul>
                                </div>

                                <div className='dm-channels'>
                                  <div className='channels-header-thing'>
                                    <h1 onClick={this.openDMModal} className='direct-messages-title'>Direct Messages</h1>
                                  <div
                                      className='plus-sign-create'
                                      onClick={this.openDMModal}>
                                      <span>
                                        <i className="fa fa-plus-circle"></i>
                                      </span>
                                    </div>
                                  </div>

                                  <ul>
                                    {this.props.directmessages.map((dm,idx) =>
                                      <li key={dm.id} className='direct-message-li'>
                                        <NavLink to={`/channels/${dm.id}`} className='channel-list-li' activeClassName="selected" >
                                          <span>#</span> {dm.users.filter((user) => this.props.currentUser.username !== user.username).map(user => user.username).join(', ')}
                                          </NavLink>
                                          <li className='dm-remove-li' onClick={this.removeChannel} value={dm.id}><i className="fa fa-times"></i></li>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </section>
                              );
                            }
                          }

                          export default withRouter(ChannelList);
