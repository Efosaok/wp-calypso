/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ActionCard from 'components/action-card';
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import isBusinessPlanUser from 'state/selectors/is-business-plan-user';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PurchasesHeader from '../purchases/purchases-list/header';
import PurchasesSite from '../purchases/purchases-site';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getPurchasesBySite } from 'lib/purchases';
import getSites from 'state/selectors/get-sites';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'state/purchases/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class PendingPurchases extends Component {
	isDataLoading() {
		if ( this.props.isFetchingUserPurchases && ! this.props.hasLoadedUserPurchasesFromServer ) {
			return true;
		}

		return ! this.props.sites.length;
	}

	render() {
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && this.props.purchases.length ) {
			content = (
				<div>
					{ getPurchasesBySite( this.props.purchases, this.props.sites ).map( site => (
						<PurchasesSite
							key={ site.id }
							siteId={ site.id }
							name={ site.name }
							domain={ site.domain }
							slug={ site.slug }
							purchases={ site.purchases }
						/>
					) ) }
				</div>
			);
		}

		if ( this.props.hasLoadedUserPurchasesFromServer && ! this.props.purchases.length ) {
			content = (
				<CompactCard className="pending-purchases__no-content">
					<EmptyContent
						title={ this.props.translate( 'Looking to upgrade?' ) }
						line={ this.props.translate(
							'Our plans give your site the power to thrive. ' + 'Find the plan that works for you.'
						) }
						action={ this.props.translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</CompactCard>
			);
		}

		return (
			<Main className="pending-purchases">
				<QueryUserPurchases userId={ this.props.userId } />
				<PageViewTracker path="/me/purchases/pending" title="Pending Purchases" />
				<MeSidebarNavigation />
				<PurchasesHeader section="pending" />
				{ content }
			</Main>
		);
	}
}

PendingPurchases.propTypes = {
	isBusinessPlanUser: PropTypes.bool.isRequired,
	noticeType: PropTypes.string,
	purchases: PropTypes.oneOfType( [ PropTypes.array, PropTypes.bool ] ),
	sites: PropTypes.array.isRequired,
	userId: PropTypes.number.isRequired,
};

export default connect(
	state => {
		const userId = getCurrentUserId( state );
		return {
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			isBusinessPlanUser: isBusinessPlanUser( state ),
			isFetchingUserPurchases: isFetchingUserPurchases( state ),
			purchases: getUserPurchases( state, userId ),
			sites: getSites( state ),
			userId,
		};
	},
	{ recordTracksEvent }
)( localize( PendingPurchases ) );
