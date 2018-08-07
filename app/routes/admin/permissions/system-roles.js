import Route from '@ember/routing/route';

export default Route.extend({
  titleToken() {
    return this.get('l10n').t('System Roles');
  },
  async model() {
    return {
      userPermissions : await this.get('store').findAll('user-permission'),
      systemRoles     : await this.get('store').findAll('custom-system-role')
    };
  },
  actions: {
    willTransition() {
      this.get('controller.model.userPermissions').forEach(userPermission => {
        userPermission.rollbackAttributes();
      });
    }
  }
});
