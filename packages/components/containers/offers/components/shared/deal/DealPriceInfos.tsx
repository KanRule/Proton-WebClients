import { Price } from '@proton/components/components';

import { getDealBilledDescription, getStandardPriceDescription } from '../../../helpers/offerCopies';
import { useDealContext } from './DealContext';

const DealPriceInfos = () => {
    const {
        deal: { cycle, prices, star },
        currency,
    } = useDealContext();
    const { withCoupon = 0, withoutCouponMonthly = 0 } = prices || {};

    const amountDue = (
        <Price key="deal-amount" currency={currency} isDisplayedInSentence>
            {withCoupon}
        </Price>
    );

    const regularPrice = (
        <span key="deal-regular-price">
            <Price currency={currency}>{withoutCouponMonthly * cycle}</Price>
        </span>
    );

    return (
        <div className="mb-2 w100">
            <small className="w100 color-weak text-left">
                <span className="block">
                    {getDealBilledDescription(cycle, amountDue)} {star ? <sup>{star}</sup> : null}
                </span>
                <span className="block">{getStandardPriceDescription(cycle, regularPrice)}</span>
            </small>
        </div>
    );
};

export default DealPriceInfos;
