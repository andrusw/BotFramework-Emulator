import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import azureAuth from '../../../../../data/reducer/azureAuthReducer';
import { LuisEditorContainer } from './luisEditorContainer';
import { LuisEditor } from './luisEditor';
import { DialogService } from '../../../../dialogs/service';
import { LuisService } from 'msbot/bin/models';
import { PrimaryButton } from '@bfemulator/ui-react';

jest.mock('../../../../dialogs/service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

describe('The AzureLoginFailedDialogContainer component should', () => {
  let parent;
  let node;
  let mockService;

  beforeEach(() => {
    mockService = JSON.parse(`{
            "type": "luis",
            "id": "b5af3f67-7ec8-444a-ae91-c4f02883c8f4",
            "name": "It's mathmatical!",
            "version": "0.1",
            "appId": "121221",
            "authoringKey": "poo",
            "subscriptionKey": "emoji"
        }`);
    parent = mount(<Provider store={ createStore(combineReducers({ azureAuth })) }>
      <LuisEditorContainer luisService={ mockService }/>
    </Provider>);
    node = parent.find(LuisEditor);
  });

  it('should render deeply', () => {
    expect(parent.find(LuisEditorContainer)).not.toBe(null);
    expect(parent.find(LuisEditor)).not.toBe(null);
  });

  it('should contain a cancel and updateLuisService functions in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).updateLuisService).toBe('function');
  });

  it('should exit with a 0 value when canceled', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance.props.cancel();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should make a copy of the luis service passed in the props', () => {
    const instance = node.instance();
    expect(instance.state.luisService instanceof LuisService).toBeTruthy();
    expect(instance.state.luisService).not.toEqual(mockService);
  });

  it('should produce an error when a required input field is null', () => {
    const instance = node.instance();
    instance.onInputChange('name', true, '');
    expect(instance.state.luisService.name).toBe('');
    expect(instance.state.nameError).not.toBeNull();
  });

  it('should exit with the newly edited luis mode when clicking submit', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    instance._textFieldHandlers.name('renamed model');
    instance.onSubmitClick();
    const mockMock = { ...mockService };
    mockMock.name = 'renamed model';
    expect(spy).toHaveBeenCalledWith([new LuisService(mockMock)]);
  });

  it('should enable the submit button when all required fields have non-null values', () => {
    const instance = node.instance();
    instance._textFieldHandlers.name('renamed model');
    instance._textFieldHandlers.subscriptionKey(''); // non-required field
    instance.render();
    const submitBtn = node.find(PrimaryButton);
    expect(submitBtn.props.disabled).toBeFalsy();
  });
});
