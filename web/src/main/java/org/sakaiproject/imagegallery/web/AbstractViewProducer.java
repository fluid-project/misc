package org.sakaiproject.imagegallery.web;

import java.util.Arrays;
import java.util.List;

import uk.org.ponder.rsf.flow.jsfnav.NavigationCase;
import uk.org.ponder.rsf.view.ViewIDReporter;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;

public abstract class AbstractViewProducer  implements ViewIDReporter {
	protected ImageLocator imageLocator;

	protected static String getProducerViewID(Class<? extends AbstractViewProducer> producerClass) {
		String classname = producerClass.getName();
		int startPos = classname.lastIndexOf(".") + 1;
		int endPos = classname.endsWith("Producer") ? classname.lastIndexOf("Producer") : classname.length();
		return classname.substring(startPos, endPos);
	}
	
	public static List<NavigationCase> getSimpleNavigationCase(Class<? extends AbstractViewProducer> producerClass) {
		return Arrays.asList(new NavigationCase[] {new NavigationCase(new SimpleViewParameters(getProducerViewID(producerClass)))});
	}

	public String getViewID() {
		return getProducerViewID(this.getClass());
	}

	public void setImageLocator(ImageLocator imageLocator) {
		this.imageLocator = imageLocator;
	}

}
